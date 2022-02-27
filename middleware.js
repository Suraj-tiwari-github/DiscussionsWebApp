
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const { replySchema } = require("./schemas.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash(
      "error",
      "You Must Register/Login to Create a New Discussion Topic"
    );
    return res.redirect("/login");
  }
  next();
};



module.exports.validateReply = (req, res, next) => {
  const { error } = replySchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};