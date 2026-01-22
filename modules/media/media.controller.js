import Media from './media.model.js'

export const uploadMedia = async(req, res) => {
    const files = req.files || [];

    const mediaDocs = await Media.insertMany(
        files.map((file) => ({
            booking: req.body.bookingId,
            url: file.path,
        }))
    )

    res.status(201).json({
        success: true,
        media: mediaDocs,
    })
}


export const getGalleryByBooking = async(req, res) => {
    const media = await Media.find({
        booking: req.params.bookingId,
    })

    res.json({
        success: true,
        media,
    })
}


export const deleteMedia = async (req, res) => {
    await Media.findByIdAndDelete(req.params.id);

    res.json({
        success: true,
        message: "Media deleted",
    })
}