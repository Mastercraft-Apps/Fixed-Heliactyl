const settings = require("../settings.json");
const fetch = require('node-fetch');
const getPteroUser = require('../misc/getPteroUser.js');

const { domain, key } = settings.pterodactyl;
const { allow: { regen }, passwordgenerator: { length: passwordLength } } = settings.api.client;

module.exports.load = async function (app, db) {
  const redirectToPanel = (req, res) => res.redirect(domain);
  
  const updateInfo = async (req, res) => {
    try {
      if (!req.session.pterodactyl) return res.redirect("/login");

      const cacheaccount = await getPteroUser(req.session.userinfo.id, db);

      if (!cacheaccount) return;
      req.session.pterodactyl = cacheaccount.attributes;
      
      if (req.query.redirect && typeof req.query.redirect === "string") {
        return res.redirect("/" + req.query.redirect);
      }
      res.redirect("/settings");
    } catch (error) {
      res.send("An error has occurred while attempting to update your account information and server list.");
    }
  };

  const regeneratePassword = async (req, res) => {
    try {
      if (!req.session.pterodactyl) return res.redirect("/login");
      if (!regen) return res.send("You cannot regenerate your password currently.");

      if (newsettings.pterodactyl.domain.slice(-1) == "/")
      newsettings.pterodactyl.domain = newsettings.pterodactyl.domain.slice(0, -1);

      
      const newpassword = generateRandomPassword(passwordLength);
      req.session.password = newpassword;

      await fetch(
        `${domain}/api/application/users/${req.session.pterodactyl.id}`,
        {
          method: "PATCH",
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${key}`
          },
          body: JSON.stringify({
            username: req.session.pterodactyl.username,
            email: req.session.pterodactyl.email,
            first_name: req.session.pterodactyl.first_name,
            last_name: req.session.pterodactyl.last_name,
            password: newpassword
          })
        }
      );
      res.redirect("/settings");
    } catch (error) {
      res.send("An error occurred while attempting to regenerate your password.");
    }
  };

  app.get("/panel", redirectToPanel);
  app.get("/updateinfo", updateInfo);
  app.get("/regen", regeneratePassword);
};

function generateRandomPassword(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}