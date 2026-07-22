import { cloudinary } from "../config/cloudinary.config.js"

const uploadToCloudinary = async (fileBuffer, folder) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `billsplit/${folder}`,
          resource_type: "image",
          transformation: [
            { width: 500, height: 500, crop: "fill" }, // resize
            { quality: "auto" },                        // optimize
            { fetch_format: "auto" }                    // best format
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(fileBuffer)
    })

    return result.secure_url // returns the image URL

  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`)
  }
}

export default uploadToCloudinary