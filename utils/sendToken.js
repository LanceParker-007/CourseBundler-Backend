export const sendToken = (res, user, message, statusCode = 200) => {
  const token = user.getJWTToken();

  const options = {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
    httpOnly: true,
    secure: true, //true hone se website pe cookie ayegi postman pe nahi
    sameSite: "Lax", //lax for dev(frontend localhost), // none when both hosted
  };

  res.status(201).cookie("token", token, options).json({
    success: true,
    message,
    user,
  });
};
