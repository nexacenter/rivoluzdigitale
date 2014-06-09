/* twitter_bot.go */

/*-
 * Copyright (c) 2013 Simone Basso <bassosimone@gmail.com>
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

/*
 * Helper script to manage the account of RivoluzDigitale.
 */

/*
 * Notes on how to operate this piece of software, to be translated
 * in English:
 *
 * --- begin notes ---
 *
 * 1) Per farlo funzionare, ti devi installare una dipendenza:
 *
 *    github.com/mrjones/oauth.
 *
 * In go e' possibile chiedere di scaricare un repository, e.g. da github, e
 * aggiungerlo alle dipendenze.
 *
 * Il comando per scaricare e installare penso sia `go get <foo>`, ma non ho la
 * certezza dato che non tengo la history.
 *
 * Comunque, una volta che hai la dipendenza, il comando per compilare ed
 * eseguire e':
 *
 *   go run <file>
 *
 * 2) Inoltre, hai bisogno di creare una tua applicazione su dev.twitter.com:
 *
 * 2.1) fai sign in su dev.twitter.com;
 *
 * 2.2) una volta dentro, clicchi in alto a destra sull'icona del tuo contatto
 * e clicchi su my applications;
 *
 * 2.3) a quel punto puoi creare una nuova applicazione;
 *
 * 2.4) ti serve un access token read-write e devi salvare in
 * `$HOME/.rd_twitter_bot` queste informazioni:
 *
 *   {
 *     "accessToken": "foo",
 *     "accessTokenSecret": "bar",
 *     "consumerKey": "foobar",
 *     "consumerSecret": "snafu",
 *     "twitterHandle": "baz"
 *   }
 *
 * Nota: "baz" e non "@baz".
 *
 * Sono tutte informazioni che trovi nella pagina di riepilogo della App
 * dopo che l'hai creata.
 *
 * Con questa configurazione lo script di gestione dovrebbe funzionare.
 *
 * 3) La funzione SearchRealtime() e' solo abbozzata e non funziona.
 *
 * Al momento, per seguire in 'realtime' un evento uso uno script tipo
 * questo e poi disambiguo i tweet quando li post processo.
 *
 * #!/bin/sh
 * 
 * while [ true ]; do
 *     go run twitter_bot.go --search > `date +%Y-%m-%dT%H:%M`.txt
 *     sleep 300
 * done
 *
 * --- end notes ---
 */

package main

import (
    "bufio"
    "encoding/json"
    "errors"
    "flag"
    "fmt"
    "github.com/mrjones/oauth"
    "io/ioutil"
    "log"
    "os"
    "reflect"
    "strings"
    "time"
)

type TwitterBot struct {
    config map[string]string
    configFile string
    consumer *oauth.Consumer
    serviceProvider *oauth.ServiceProvider
}

func MakeTwitterBot() (self TwitterBot) {
    self.config = map[string]string{
        "accessToken": "",
        "accessTokenSecret": "",
        "consumerKey": "",
        "consumerSecret": "",
        "twitterHandle":"",
    }
    self.serviceProvider = &oauth.ServiceProvider{
        RequestTokenUrl:    "https://api.twitter.com/oauth/request_token",
        AuthorizeTokenUrl:  "https://api.twitter.com/oauth/authorize",
        AccessTokenUrl:     "https://api.twitter.com/oauth/access_token",
    }
    return self
}

func (self TwitterBot) GetConfigFile() string {
    if self.configFile == "" {
        home := os.Getenv("HOME")  // XXX
        path := home + string(os.PathSeparator) + ".rd_twitter_bot"
        return path
    }
    return self.configFile
}

func (self TwitterBot) verifyConfigFile(fpath string) error {
    finfo, err := os.Stat(fpath)
    if err != nil {
        return err
    }
    mode := finfo.Mode()
    if mode.Perm() != 0600 {
        return errors.New("verifyConfigFile: invalid perms")
    }
    if (mode & os.ModeType) != 0 {
        return errors.New("verifyConfigFile: not a regular file")
    }
    // TODO: check whether the owner is the user
    return nil
}

func (self TwitterBot) ReadConfigFile() error {
    filepath := self.GetConfigFile()
    err := self.verifyConfigFile(filepath)
    if err != nil {
        return err
    }
    data, err := ioutil.ReadFile(filepath)
    if err != nil {
        return err
    }
    return json.Unmarshal(data, &self.config);
}

func (self TwitterBot) PrintConfiguration() error {
    data, err := json.MarshalIndent(self.config, "", "    ")
    if err != nil {
        return err
    }
    _, err = fmt.Printf("%s\n", data)
    return err
}

func (self TwitterBot) Follow(screenName string) ([]byte, error) {
    const uri = "https://api.twitter.com/1.1/friendships/create.json"
    params := map[string]string{
        "screen_name": screenName,
    }
    accessToken := &oauth.AccessToken{
        Token: self.config["accessToken"],
        Secret: self.config["accessTokenSecret"],
    }

    consumer := oauth.NewConsumer(self.config["consumerKey"],
                                  self.config["consumerSecret"],
                                  *self.serviceProvider)

    //consumer.Debug(true)

    resp, err := consumer.Post(uri, params, accessToken)
    if err != nil {
        return nil, err
    }

    defer resp.Body.Close()

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return nil, err
    }

    return body, nil
}

func (self TwitterBot) Unfollow(screenName string) ([]byte, error) {
    const uri = "https://api.twitter.com/1.1/friendships/destroy.json"
    params := map[string]string{
        "screen_name": screenName,
    }
    accessToken := &oauth.AccessToken{
        Token: self.config["accessToken"],
        Secret: self.config["accessTokenSecret"],
    }

    consumer := oauth.NewConsumer(self.config["consumerKey"],
                                  self.config["consumerSecret"],
                                  *self.serviceProvider)

    resp, err := consumer.Post(uri, params, accessToken)
    if err != nil {
        return nil, err
    }

    defer resp.Body.Close()

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return nil, err
    }

    return body, nil
}

func (self TwitterBot) GetFriends() ([]byte, error) {
    const uri = "https://api.twitter.com/1.1/friends/list.json"
    params := map[string]string{
        "count": "300",
        "screen_name": self.config["twitterHandle"],
        "skip_status": "1",
        "include_user_entities": "0",
    }
    accessToken := &oauth.AccessToken{
        Token: self.config["accessToken"],
        Secret: self.config["accessTokenSecret"],
    }

    consumer := oauth.NewConsumer(self.config["consumerKey"],
                                  self.config["consumerSecret"],
                                  *self.serviceProvider)

    resp, err := consumer.Get(uri, params, accessToken)
    if err != nil {
        return nil, err
    }

    defer resp.Body.Close()

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return nil, err
    }

    return body, nil
}

func (self TwitterBot) GetMentions() ([]byte, error) {
    const uri = "https://api.twitter.com/1.1/statuses/mentions_timeline.json"
    params := map[string]string{
        "count": "800",
    }
    accessToken := &oauth.AccessToken{
        Token: self.config["accessToken"],
        Secret: self.config["accessTokenSecret"],
    }

    consumer := oauth.NewConsumer(self.config["consumerKey"],
                                  self.config["consumerSecret"],
                                  *self.serviceProvider)

    resp, err := consumer.Get(uri, params, accessToken)
    if err != nil {
        return nil, err
    }

    defer resp.Body.Close()

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return nil, err
    }

    return body, nil
}

func (self TwitterBot) Search() ([]byte, error) {
    const uri = "https://api.twitter.com/1.1/search/tweets.json"
    params := map[string]string{
        "count": "100",
        "q": "#RivoluzDigitale",
        "result_type": "mixed",
    }
    accessToken := &oauth.AccessToken{
        Token: self.config["accessToken"],
        Secret: self.config["accessTokenSecret"],
    }

    consumer := oauth.NewConsumer(self.config["consumerKey"],
                                  self.config["consumerSecret"],
                                  *self.serviceProvider)

    resp, err := consumer.Get(uri, params, accessToken)
    if err != nil {
        return nil, err
    }

    defer resp.Body.Close()

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return nil, err
    }

    return body, nil
}

func (self TwitterBot) GetFollowers(cursor string) ([]byte, error) {
    const uri = "https://api.twitter.com/1.1/followers/list.json"
    params := map[string]string{
        "count": "1000",
        "screen_name": self.config["twitterHandle"],
        "skip_status": "1",
        "include_user_entities": "0",
        "cursor": cursor,
    }
    accessToken := &oauth.AccessToken{
        Token: self.config["accessToken"],
        Secret: self.config["accessTokenSecret"],
    }

    consumer := oauth.NewConsumer(self.config["consumerKey"],
                                  self.config["consumerSecret"],
                                  *self.serviceProvider)

    resp, err := consumer.Get(uri, params, accessToken)
    if err != nil {
        return nil, err
    }

    defer resp.Body.Close()

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return nil, err
    }

    return body, nil
}

func (self TwitterBot) GetTweets(user string) ([]byte, error) {
    const uri = "https://api.twitter.com/1.1/statuses/user_timeline.json"
    params := map[string]string{
        "count": "200",
        "screen_name": user,
        //"trim_user": "1",
        //"max_id": "315451926944833537",
    }
    accessToken := &oauth.AccessToken{
        Token: self.config["accessToken"],
        Secret: self.config["accessTokenSecret"],
    }

    consumer := oauth.NewConsumer(self.config["consumerKey"],
                                  self.config["consumerSecret"],
                                  *self.serviceProvider)

    resp, err := consumer.Get(uri, params, accessToken)
    if err != nil {
        return nil, err
    }

    defer resp.Body.Close()

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return nil, err
    }

    return body, nil
}

func (TwitterBot) JsonFindCursor(data []byte) (string, error) {
    var result interface{}

    err := json.Unmarshal(data, &result)
    if err != nil {
        return "", err
    }

    /*
     * XXX I failed to unmarshal into a structure, so I used reflection
     * to parse the result. This is probably overkill.
     */
    if reflect.TypeOf(result).Kind() != reflect.Map {
        return "", errors.New("returned object is not a map")
    }
    message := result.(map[string]interface{})
    cursor := message["next_cursor_str"]

    return cursor.(string), nil
}

func (TwitterBot) JsonProcessUsers(data []byte) error {
    var result interface{}

    err := json.Unmarshal(data, &result)
    if err != nil {
        return err
    }

    /*
     * XXX I failed to unmarshal into a structure, so I used reflection
     * to parse the result. This is probably overkill.
     */
    if reflect.TypeOf(result).Kind() != reflect.Map {
        return errors.New("returned object is not a map")
    }
    message := result.(map[string]interface{})

    users := message["users"]
    if reflect.TypeOf(users).Kind() != reflect.Slice {
        return errors.New("result['users'] is not a slice")
    }
    usersvec := users.([]interface{})
    for i := 0; i < len(usersvec); i += 1 {
        if reflect.TypeOf(usersvec[i]).Kind() != reflect.Map {
            return errors.New("result['users'][i] is not a map")
        }

        follower := usersvec[i].(map[string]interface{})
        for key, opaque := range follower {
            if key == "screen_name" {
                value := opaque.(string)  /* XXX Unsafe cast */
                _, err = fmt.Printf("@%s\n", strings.ToLower(value))
                if err != nil {
                    return err
                }
            }
        }
    }

    return nil
}

func (TwitterBot) JsonProcessTweets(data []byte) error {
    var result interface{}

    err := json.Unmarshal(data, &result)
    if err != nil {
        return err
    }

    /*
     * XXX I failed to unmarshal into a structure, so I used reflection
     * to parse the result. This is probably overkill.
     */
    if reflect.TypeOf(result).Kind() != reflect.Slice {
        if reflect.TypeOf(result).Kind() != reflect.Map {
	     return errors.New("returned object is neither a slice nor a map")
        }
        result_as_map := result.(map[string]interface{})
        statuses, present := result_as_map["statuses"]
        if ! present {
             return errors.New("missing statuses entry")
        }
        result = statuses
        if reflect.TypeOf(result).Kind() != reflect.Slice {
	     return errors.New("returned object is not a slice")
        }
    }
    slice := result.([]interface{})
    for i := len(slice) - 1; i >= 0; i -= 1 {
        if reflect.TypeOf(slice[i]).Kind() != reflect.Map {
            return errors.New("internal object is not a map")
        }

        created_at := ""
        id_str := ""
        text:= ""
        screen_name := ""

        tweet := slice[i].(map[string]interface{})
        for key, opaque := range tweet {
            if key == "created_at" {
                created_at = opaque.(string)  /* XXX Unsafe cast */
            } else if key == "id_str" {
                id_str = opaque.(string)  /* XXX Unsafe cast */
            } else if key == "text" {
                text = opaque.(string)  /* XXX Unsafe cast */
                text = strings.Replace(text, "\n", " ", -1)
            } else if key == "user" {
                user := opaque.(map[string]interface{})
                for ukey, uopaque := range user {
                    if ukey == "id_str" {
                        //userid = uopaque.(string)  /* XXX Unsafe cast */
                    } else if ukey == "screen_name" {
                        screen_name = uopaque.(string)  /* XXX Unsafe cast */
                    }
                }
            }
        }

        if false {
            if strings.Contains(text, "RT @") {
                continue
            }
            text = strings.Replace(text, "#RivoluzDigitale", "", -1)
            for strings.Index(text, "  ") >= 0 {
                text = strings.Replace(text, "  ", " ", -1)
            }
            for len(text) > 0 && (text[0] == ' ' || text[0] == ':') {
                text = text[1:]
            }
            _, err = fmt.Printf("- @%s: %s\n\n", screen_name, text)
        } else {
            _, err = fmt.Printf("[%s] <https://twitter.com/%s/status/%s> @%s: %s\n\n", created_at, screen_name, id_str, screen_name, text)
        }
        if err != nil {
            return err
        }
    }

    return nil
}

func (TwitterBot) JsonPrettyprint(data []byte) error {
    var result interface{}

    err := json.Unmarshal(data, &result)
    if err != nil {
        return err
    }
    data, err = json.MarshalIndent(result, "", "    ")
    if err != nil {
        return err
    }
    _, err = fmt.Printf("%s\n\n\n", data)

    return err
}


func (TwitterBot) JsonWriteFile(file string, data []byte) error {
    var result interface{}

    err := json.Unmarshal(data, &result)
    if err != nil {
        return err
    }
    data, err = json.MarshalIndent(result, "", "    ")
    if err != nil {
        return err
    }
    formatted := fmt.Sprintf("%s\n", data)
    err = ioutil.WriteFile(file, []byte(formatted), 0644)

    return err
}

func (self TwitterBot) SearchRealtime() ([]byte, error) {
    const uri = "https://api.twitter.com/1.1/statuses/filter.json"
    params := map[string]string{
        "track": "Letta",
    }
    accessToken := &oauth.AccessToken{
        Token: self.config["accessToken"],
        Secret: self.config["accessTokenSecret"],
    }

    consumer := oauth.NewConsumer(self.config["consumerKey"],
                                  self.config["consumerSecret"],
                                  *self.serviceProvider)

    consumer.Debug(true)

    resp, err := consumer.Post(uri, params, accessToken)
    if err != nil {
        return nil, err
    }

    defer resp.Body.Close()

    reader := bufio.NewReader(resp.Body)
    var (
         isprefix bool = true
         line []byte
        )
    for isprefix && err == nil {
        line, isprefix, err = reader.ReadLine()
        fmt.Println("%s", line)
    }

    return nil, nil
}

func usage() {
    fmt.Fprintf(os.Stderr,
      "usage: twitter_bot [-all] [-follow user] [-mode mode] [-raw]\n")
    fmt.Fprintf(os.Stderr,
      "                   [-tweets user] [-unfollow user]\n")
    fmt.Fprintf(os.Stderr, "modes: followers friends mentions search\n")
    os.Exit(1)
}

func main() {

    twitterbot := MakeTwitterBot()
    err := twitterbot.ReadConfigFile()
    if err != nil {
        log.Fatal(err)
    }

    var all = flag.Bool("all", false, "Get all, not just first page")
    var follow = flag.String("follow", "", "Follow the specified user")
    var mode = flag.String("mode", "",
      "Select the program mode (friends, followers, mentions, search")
    var raw = flag.Bool("raw", false, "Output the raw JSON")
    var tweets = flag.String("tweets", "", "Get tweets of the specified user")
    var unfollow = flag.String("unfollow", "", "Unfollow the specified user")

    flag.Usage = usage
    flag.Parse()

    if *follow != "" {
        *follow = strings.Replace(*follow, "@", "", 1)
        body, err := twitterbot.Follow(*follow)
        if err != nil {
            log.Fatal(err)
        }
        if *raw {
            err = twitterbot.JsonPrettyprint(body)
            if err != nil {
                log.Fatal(err)
            }
        } else {
            fmt.Fprintf(os.Stdout, "OK\n")
        }
        os.Exit(0)
    }

    if *unfollow != "" {
        *unfollow = strings.Replace(*unfollow, "@", "", 1)
        body, err := twitterbot.Unfollow(*unfollow)
        if err != nil {
            log.Fatal(err)
        }
        if *raw {
            err = twitterbot.JsonPrettyprint(body)
            if err != nil {
                log.Fatal(err)
            }
        } else {
            fmt.Fprintf(os.Stdout, "OK\n")
        }
        os.Exit(0)
    }

    if *tweets != "" {
        body, err := twitterbot.GetTweets(*tweets)
        if err != nil {
            log.Fatal(err)
        }
        if *raw {
            err = twitterbot.JsonPrettyprint(body)
        } else {
            err = twitterbot.JsonProcessTweets(body)
        }
        if err != nil {
            log.Fatal(err)
        }
        os.Exit(0)
    }

    if *mode == "friends" {
        body, err := twitterbot.GetFriends()
        if err != nil {
            log.Fatal(err)
        }
        if *raw {
            err = twitterbot.JsonPrettyprint(body)
        } else {
            err = twitterbot.JsonProcessUsers(body)
        }
        if err != nil {
            log.Fatal(err)
        }
        os.Exit(0)
    }

    if *mode == "followers" {
        cursor := "-1"
        for {
            body, err := twitterbot.GetFollowers(cursor)
            if err != nil {
                log.Fatal(err)
            }
            cursor, err = twitterbot.JsonFindCursor(body)
            if err != nil {
                log.Fatal(err)
            }
            if (cursor == "0") {
                break
            }
            time.Sleep(1500 * time.Millisecond)
            if *raw {
                err = twitterbot.JsonPrettyprint(body)
            } else {
                err = twitterbot.JsonProcessUsers(body)
            }
            if err != nil {
                log.Fatal(err)
            }
            if !*all {
                break
            }
        }
        os.Exit(0)
    }

    if *mode == "mentions" {
        body, err := twitterbot.GetMentions()
        if err != nil {
            log.Fatal(err)
        }
        if *raw {
            err = twitterbot.JsonPrettyprint(body)
        } else {
            err = twitterbot.JsonProcessTweets(body)
        }
        if err != nil {
            log.Fatal(err)
        }
        os.Exit(0)
    }

    if *mode == "search" {
        // Commented out because it's not working yet:
/*
        if len(os.Args) >= 3 && os.Args[2] == "--realtime" {
            _, err := twitterbot.SearchRealtime()
            if err != nil {
                log.Fatal(err)
            }
            os.Exit(0)
        }
*/

        body, err := twitterbot.Search()
        if err != nil {
            log.Fatal(err)
        }
        if *raw {
            err = twitterbot.JsonPrettyprint(body)
        } else {
            err = twitterbot.JsonProcessTweets(body)
        }
        if err != nil {
            log.Fatal(err)
        }
        os.Exit(0)
    }

    usage()
}
