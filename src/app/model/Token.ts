export class IToken {
  access_token: string;
  token_type: string;
  expires_in: string;
}


export class ILoginCredential {
  username: string;
  password: string;
  grant_type: string;
}
