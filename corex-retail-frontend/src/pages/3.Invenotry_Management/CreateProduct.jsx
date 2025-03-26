import React, { useState, useReducer } from "react";
import FloatingLabelInput from "../../components/small/FloatingLabelInput";
import FloatingLabelSelect from "../../components/small/FloatingLabelSelect";

const FORM_OPTIONS = {
  Category :[
    { value: "iPhone", label: "iPhone" },
    { value: "iPad", label: "iPad" },
    { value: "iMac", label: "iMac" },
    { value: "iWatch", label: "iWatch" },
  ],
  Status :[
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    { value: "OnHold", label: "OnHold" },
  ]
};

const CreateProducts = () => {
  const [product, setProduct] = useState({
    product_id: "",
    name: "",
    category: "",
    current_stock: 0,
    reorder_point: 0,
    reorder_quantity: 0,
    lead_time_days: 0,
    cost_price: 0,
    selling_price: 0,
    margin_percentage: 0,
    weight: 0,
    dimensions: "",
    storage_location: "",
    date_added: new Date().toISOString().split("T")[0],
    expiration_date: "",
    status: "active",
  });

  const [images, setImages] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-calculate margin percentage when cost_price or selling_price changes
    if (name === "cost_price" || name === "selling_price") {
      const costPrice =
        name === "cost_price"
          ? parseFloat(value)
          : parseFloat(product.cost_price);
      const sellingPrice =
        name === "selling_price"
          ? parseFloat(value)
          : parseFloat(product.selling_price);

      let marginPercentage = 0;
      if (sellingPrice > 0) {
        marginPercentage = ((sellingPrice - costPrice) / sellingPrice) * 100;
      }

      setProduct({
        ...product,
        [name]: value,
        margin_percentage: marginPercentage.toFixed(2),
      });
    } else {
      setProduct({
        ...product,
        [name]: value,
      });
    }
  };

  // Handle image uploads
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    const newImagePreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      alt: file.name,
      is_primary: images.length === 0 ? true : false,
    }));

    setSelectedFiles([...selectedFiles, ...files]);
    setImages([...images, ...newImagePreviews]);
  };

  // Remove an image
  const removeImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);

    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);

    // Make sure there's a primary image if any images remain
    if (
      updatedImages.length > 0 &&
      !updatedImages.some((img) => img.is_primary)
    ) {
      updatedImages[0].is_primary = true;
    }

    setImages(updatedImages);
    setSelectedFiles(updatedFiles);
  };

  // Set an image as primary
  const setPrimaryImage = (index) => {
    const updatedImages = images.map((image, i) => ({
      ...image,
      is_primary: i === index,
    }));

    setImages(updatedImages);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Create a product object that includes the images array
    const productData = {
      ...product,
      images: images,
    };

    // Here you would typically send the data to your API
    console.log("Product data to be submitted:", productData);

    // In a real application, you would use FormData to handle file uploads
    // const formData = new FormData();
    // formData.append('product', JSON.stringify(productData));
    // selectedFiles.forEach((file, index) => {
    //   formData.append(`image_${index}`, file);
    // });

    // Reset form after submission if needed
    // setProduct({...});
    // setImages([]);
    // setSelectedFiles([]);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Create New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Product Information */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FloatingLabelInput
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              label="Product Name"
              required
            />

            <div>
            
              <FloatingLabelSelect
                name="category"
                value={product.category}
                onChange={handleChange}
                label="Category"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                options={FORM_OPTIONS.Category}
                required
              />
              
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <FloatingLabelSelect
                name="status"
                label="Status"
                value={product.status}
                onChange={handleChange}
                options={FORM_OPTIONS.Status}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              
            </div>
          </div>
        </div>

        {/* Inventory Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Inventory Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Stock
              </label>
              <input
                type="number"
                name="current_stock"
                value={product.current_stock}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reorder Point: {product.reorder_point}
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  name="reorder_point"
                  value={product.reorder_point}
                  onChange={handleChange}
                  className="w-40 h-2 bg-gray-200 rounded-lg cursor-pointer"
                  min="0"
                  max="100"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {product.reorder_point}
                </span>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reorder Quantity:
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  name="reorder_quantity"
                  value={product.reorder_quantity}
                  onChange={handleChange}
                  className="w-40 h-2 bg-gray-200 rounded-lg  cursor-pointer"
                  min="0"
                  max="1000"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {product.reorder_quantity}
                </span>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead Time (days): {product.lead_time_days}
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  name="lead_time_days"
                  value={product.lead_time_days}
                  onChange={handleChange}
                  className="w-40 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  min="0"
                  max="30"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {product.lead_time_days}
                </span>
              </div>
            </div>

            <div></div>

            <div></div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Price ($)
              </label>
              <input
                type="number"
                name="cost_price"
                value={product.cost_price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price ($)
              </label>
              <input
                type="number"
                name="selling_price"
                value={product.selling_price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margin (%)
              </label>
              <input
                type="number"
                name="margin_percentage"
                value={product.margin_percentage}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Physical Attributes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Physical Attributes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={product.weight}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dimensions (L x W x H)
              </label>
              <input
                type="text"
                name="dimensions"
                value={product.dimensions}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g. 10cm x 5cm x 2cm"
              />
            </div>
          </div>
        </div>

        {/* Location and Dates */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Location and Dates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storage Location
              </label>
              <input
                type="text"
                name="storage_location"
                value={product.storage_location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Added
              </label>
              <input
                type="date"
                name="date_added"
                value={product.date_added}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date (if applicable)
              </label>
              <input
                type="date"
                name="expiration_date"
                value={product.expiration_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Product Images</h2>

          {/* Image upload area */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-7">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 text-gray-400 group-hover:text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                    Drag and drop or click to upload
                  </p>
                </div>
                <input
                  type="file"
                  className="opacity-0"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>

          {/* Image previews */}
          {images.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Image Previews</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative border rounded-md overflow-hidden group"
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-40 object-cover"
                    />

                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center space-x-1">
                        <input
                          type="radio"
                          id={`primary-${index}`}
                          name="primary-image"
                          checked={image.is_primary}
                          onChange={() => setPrimaryImage(index)}
                          className="h-4 w-4"
                        />
                        <label
                          htmlFor={`primary-${index}`}
                          className="text-white text-xs"
                        >
                          Primary Image
                        </label>
                      </div>
                    </div>

                    {image.is_primary && (
                      <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProducts;
