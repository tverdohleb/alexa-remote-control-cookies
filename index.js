#!/usr/bin/env node

// eslint-disable no-console

const commander = require('commander');
const Prompt = require('prompt-password');
const nightmare = require('nightmare');

const browser = nightmare({
  show: false,
});

const login = (email, password) =>
  new Promise((resolve, reject) => {
    const url =
      'https://www.amazon.com/ap/signin?_encoding=UTF8&ignoreAuthState=1&openid.assoc_handle=usflex&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.ns.pape=http%3A%2F%2Fspecs.openid.net%2Fextensions%2Fpape%2F1.0&openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2F%3Fref_%3Dnav_custrec_signin&switch_account=';
    return browser
      .goto(url)
      .type('#ap_email', email)
      .type('#ap_password', password)
      .click('[name=rememberMe')
      .wait(1000)
      .click('#signInSubmit') // Login
      .wait(1000)
      .goto(`https://alexa.amazon.com/api/devices-v2/device`)
      .wait(1000)
      .evaluate(() =>
        // eslint-disable-next-line no-undef
        JSON.parse(document.body.innerText),
      )
      .then(() =>
        browser.cookies
          .get({
            url: null,
          })
          .end()
          .then((cookies) => {
            const data = {};
            let strCookies = '';
            cookies.forEach((cookie) => {
              strCookies += `${cookie.name}=${cookie.value}; `;
              if (cookie.name === 'csrf') data.Csrf = cookie.value;
            });
            data.Cookie = strCookies.trimRight();
            return data;
          }),
      )
      .then((r) => {
        resolve(r);
      })
      .catch((err) => {
        reject(err);
      });
  });

const input = (question) => {
  const prompt = new Prompt({
    type: 'password',
    message: question,
    name: 'password',
  });

  return prompt.run();
};

const fromVarOrStdin = async (v, question) => {
  if (typeof v === 'string') {
    return v;
  }
  return input(question);
};

commander
  .usage('<email> <password>')
  .description('retrieve cookies')
  .action(async (email, password) => {
    if (typeof email !== 'string') {
      console.log('email required');
      return;
    }
    const pwd = await fromVarOrStdin(password, 'Enter password: ');

    const result = await login(email, pwd);
    console.log('CSRF:');
    console.log(result.Csrf);
    console.log('Cookie:');
    console.log(result.Cookie);
  });

commander.parse(process.argv);
