import * as Toot from 'tootjs'
import * as Cookies from 'js-cookie'
import { Account, UserWithRank } from './types'


export class ViewModel {
    public users: UserWithRank[] = []
    private instances: { [key: string]: Toot.Mastodon } = {}
    private searched: { [key: string]: boolean } = {}

    public getHosts() {
        var hosts = []
        for (var host in Cookies.get())
            hosts.push(host)
        return hosts
    }

    public mastodon(host: string): Toot.Mastodon {
        console.log(Toot)
        if (!this.instances[host]) {
            this.instances[host] = new Toot.Mastodon({
                host: host,
                scope: "read",
                access_token: Cookies.get(host)
            })
        }
        return this.instances[host]
    }

    public accounts(host: string, username: string): Promise<any> {
        return this.mastodon(host)
            .get(`accounts/${username}`, {})
    }

    public currentUser(host: string): Promise<any> {
        return this.mastodon(host)
            .get("accounts/verify_credentials", {})
    }

    public followers(host: string, username: string): Promise<any> {
        return this.mastodon(host)
            .get('accounts/' + username + '/following?limit=80', {})
            .then((value) => {
                return value
            })
    }

    public push(u: Account) {
        let found = this.users.find(({ e, r }) => e.acct === u.acct)
        if (found) {
            found.r++
        } else {
            this.users.push({ e: u, r: 1 })
        }
    }

    public resolve(u: string, defaultHost: string): string {
        console.log("match", u)
        let m = u.match(/[^@]+@(.+)/)
        if (m) return m[1]
        else   return defaultHost
    }

    public async searchAccount(host: string, acct: string): Promise<any> {
        this.searched[acct] = true;
        return this.mastodon(host)
            .get("accounts/search", { q: acct })
    }

    public haveSearched(acct: string): boolean {
        return this.searched[acct] === true
    }
}