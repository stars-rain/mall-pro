import { Base64 } from "js-base64";

interface Cookie {
  setCookie(user: Pick<User, "account">, exdays: number): void;
  getCookie(): Pick<User, "account">;
  deleteCookie(): void;
}

const Cookie: Cookie = {
  /**
   * 建立cookie值(用于如果用户已经登录页面在用户刷新页面时保存登录状态)
   * @param user - 用户的登录信息
   * @param exdays - cookie的有效期限
   */
  setCookie(user: Pick<User, "account">, exdays: number): void {
    //设置cookie，用户保存当前用户的登录信息
    const date: Date = new Date();
    date.setTime(date.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();//设置cookie保存期限
    document.cookie = escape(`user=${JSON.stringify(user)};${expires};path=/;`);
  },

  /**
   * 得到cookie值
   * @returns 该登录用户的登录信息
   */
  getCookie(): Pick<User, "account"> {
    let user: Pick<User, "account"> = {
      account: '',
    };
    const usr = 'user=';
    const cookie: Array<string> = unescape(document.cookie).split(";");
    for (const item of cookie) {
      //如果得到完整的用户信息就退出循环
      if (item.trim().indexOf(usr) > -1) {
        const value: string = item.trim().slice(usr.length);
        if (value.length) {
          const parseObj: Pick<User, "account"> = JSON.parse(value);
          for (const item of Object.keys(parseObj)) {
            (parseObj as any)[item] = Base64.decode((parseObj as any)[item]);
          }
          user = parseObj;
        }
        break;
      }
    }
    return user
  },

  /**
   * 删除cookie值
   */
  deleteCookie(): void {
    //删除cookie
    document.cookie = escape("user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;");
  },
}

export default Cookie