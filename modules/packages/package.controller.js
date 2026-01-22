import Package from "./package.model.js";

export const createPackage = async (req, res) => {
  const pkg = await Package.create(req.body);

  res.status(201).json({
    success: true,
    message: "Package created successfully",
    package: pkg,
  });
};

export const getPackageById = async (req, res) => {
  const pkg = await Package.findById(req.params.id);

  if (!pkg || pkg.isArchived) {
    return res.status(404).json({ message: "Package not Available" });
  }

  res.status(200).json({
    success: true,
    package: pkg,
  });
};

export const deletePackage = async (req, res) => {
  const pkg = await Package.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Package deleted",
  });
};
// export const deletePackage = async (req, res) => {
//   await Package.findByIdAndUpdate(req.params.id, {
//     isDeleted: true,
//   });
//   res.json({ message: "Package deleted" });
// };

export const reorderPackages = async (req, res) => {
  const updates = req.body;

  await Promise.all(
    updates.map(({ id, order }) => Package.findByIdAndUpdate(id, { order })),
  );

  res.json({ success: true, message: "Packages reordered" });
};

export const getAdminPackages = async (req, res) => {
  const packages = await Package.find().sort({ order: 1 });

  res.json({ success: true, packages });
};

export const getPublicPackages = async (req, res) => {
  const packages = await Package.find({
    isActive: true,
    isArchived: false,
  }).sort({ order: 1 });

  res.json({ success: true, packages });
};

// package.controller.js
export const updatePackage = async (req, res) => {
  try {
    if (req.body.coverImage === "") {
      return res.status(400).json({ message: "Cover image is required" });
    }

    const pkg = await Package.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    const allowedFields = [
      "name",
      "price",
      "duration",
      "delivery",
      "description",
      "imageCount",
      "type",
      "isActive",
      "coverImage",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        pkg[field] = req.body[field];
      }
    });

    await pkg.save();

    res.json(pkg);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

export const archivePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);

    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    pkg.isArchived = !pkg.isArchived;
    await pkg.save();

    res.json(pkg);
  } catch (err) {
    res.status(500).json({ message: "Archive failed" });
  }
};

export const togglePackageVisibility = async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  pkg.isActive = !pkg.isActive;
  await pkg.save();

  res.json(pkg);
};
