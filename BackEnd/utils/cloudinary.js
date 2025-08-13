import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: 'dgz9h9lxt',
    api_key: '356178821232157',
    api_secret: 'svGZTJJLRO-vyucqpfgmU-VEY-U'
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        // file has been uploaded successfully
        console.log("File uploaded successfully", response.url);
        return response;
    } catch (error) {
        console.error("Cloudinary upload failed:", error.message);
        return null;
    }
}

export { uploadOnCloudinary };
 