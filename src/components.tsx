import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Account, UserWithRank } from './types';
import { ChangeEvent, MouseEvent } from 'react';
import { ViewModel } from './viewmodel'

let vm = new ViewModel()

export class Index extends React.Component<{}, { username: string, foundUsers: UserWithRank[], host: string }> {

    private toggle: boolean = false;

    public componentWillMount() {
        this.setState({ username: "", foundUsers: [], host: vm.getHosts()[0] })
    }

    async addUser(): Promise<void> {
        console.log("fetching user")
        
        let user: Account = await vm.currentUser(this.state.host)
        console.log(user)
        let users: Account[] = await vm.followers(this.state.host, user.id)
        for (var u of users) {
            console.log("add")
            vm.push(u)
        }
        this.setState({ foundUsers: vm.users })
        console.log(vm.users)
        console.log("add user", this.state.foundUsers)
        return
    }

    selectInstance(e: ChangeEvent<HTMLSelectElement>) {
        this.setState({ host: e.target.value })
    }

    render() {
        return (
            <div>
                <div id="auth">
                    <div>
                        <ul>
                            <li>インスタンスURLを入力してauthをクリック(認証)</li>
                            <li>インスタンスを選んでfetchをクリック(自分のfollowを表示)</li>
                            <li>アイコンをクリックするとその人のfollowも表示</li>
                            <li>名前の横の数字は他人と重複してfollowしている人(=人気がある?)</li>
                        </ul>
                    </div>
                    <form method="get" action="/authorize">
                        <input type="text" name="host" placeholder="example.com" />
                        <input type="submit" value="authorize" />
                    </form>
                </div>
                <div id="search">
                    <HostSelect fn={ this.selectInstance.bind(this) } selects={ vm.getHosts() } />
                    <SearchButton action={ this.addUser.bind(this) } />
                </div>
                <hr />
                <div id="main">
                    <UserList users={ this.state.foundUsers }/>
                </div>
            </div>
        )
    }
}

const HostSelect: React.StatelessComponent<{ selects: string[], fn: (e: ChangeEvent<HTMLSelectElement>) => void }> = ({ selects, fn }) => {
    return (
        <select onChange={ fn }>
            { selects.map((host: string) => <option value={ host }>{ host }</option>) }
        </select>
    )
}

const UserNameInput : React.StatelessComponent<{ fn: (e: ChangeEvent<HTMLInputElement>) => void }> = ({ fn }) => {
    return (
        <input type="text" placeholder="username@example.com" defaultValue="" onChange={ fn } />
    )
}

class SearchButton extends React.PureComponent<{ action: () => void }, {}> {
    render() {
        return (
            <button onClick={ (e: MouseEvent<HTMLButtonElement>) => {
                this.props.action()
            } }>
                Fetch
            </button>
        )
    }
}

class UserList extends React.Component<{ users: UserWithRank[] }> {
    async addUser(user: UserWithRank): Promise<void> {
        if (!vm.haveSearched(user.e.acct)) {
            console.log("fetching user")
            
            let host = vm.resolve(user.e.acct, "nayukana.info")
            let account: Account[] = await vm.searchAccount(host, user.e.acct)
            console.log("acct", account)
            let users: Account[] = await vm.followers(host, account[0].id)
            for (var u of users) {
                console.log("add")
                vm.push(u)
            }
            this.setState({ foundUsers: vm.users })
            return
        }
    }
    render() {
        return (
            <div id="user-list">
                { this.props.users
                .sort((u1, u2) => u2.r - u1.r)
                .map((u) => 
                    <User user={ u } action={ this.addUser.bind(this) } />
                ) }
            </div>
        )
    }
}

class User extends React.PureComponent<{ action: (u: UserWithRank) => void; user: UserWithRank }> {
    render() {
        let user = this.props.user
        let name = user.e.display_name !== "" ? user.e.display_name : user.e.acct
        return (
            <div className="account" onClick={ (e: MouseEvent<HTMLSpanElement>) => 
                this.props.action(this.props.user)
            }>
                <div><img src={ user.e.avatar_static } width="100" height="100" /></div>
                <div><span>{ user.r } </span><a href={ user.e.url }>{ name }</a></div>
            </div>
        )
    }
}
