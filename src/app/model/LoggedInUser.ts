
export class LoggedInUser {
    user: string;

    constructor() {

    }

    getLoggedUser(): any {
        this.user = sessionStorage.getItem('currentUser');
        if (this.user !== null && this.user !== '') {
            const userObject = JSON.parse(this.user);
            return userObject;
        }

        return null;
    }

}