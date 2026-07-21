import jwt from "jsonwebtoken";

const generateAccessToken=(userId)=>{
    return jwt.sign(
        {userId},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY || "1h"}
    )
}

const generateRefreshToken=(userId)=>{
     return jwt.sign(
        {userId},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:process.env.REFRESH_TOKEN_EXPIRY || "7d"}
    )
}

const generateTokens = (res, userId) => {
  const accessToken = generateAccessToken(userId)
  const refreshToken = generateRefreshToken(userId)


res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  })

  
res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  })


  return { accessToken, refreshToken }
}

export { generateAccessToken, generateRefreshToken, generateTokens }
