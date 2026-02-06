export const AddItemForm = ({
  setAddingItem,
}: {
  setAddingItem: (value: boolean) => void;
}) => {
  return (
    <form className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bg-white p-6 rounded shadow-lg">
      <h2 className="text-xl font-bold mb-4">Add New Clothing Item</h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="name">Name:</label>
          <input
            className="p-2 bg-gray-100 w-full"
            type="text"
            name="name"
            placeholder="Enter item name"
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <input
            className="p-2 bg-gray-100 w-full"
            type="text"
            name="description"
            placeholder="Enter item description"
          />
        </div>
        <div>
          <label htmlFor="brand">Brand:</label>
          <input
            className="p-2 bg-gray-100 w-full"
            type="text"
            name="brand"
            placeholder="Enter item brand"
          />
        </div>
        <div>
          <label htmlFor="price">Price:</label>
          <input
            className="p-2 bg-gray-100 w-full"
            type="number"
            name="price"
            placeholder="Enter item price"
          />
        </div>
        <div>
          <label htmlFor="type">Type:</label>
          <input
            className="p-2 bg-gray-100 w-full"
            type="text"
            name="type"
            placeholder="Enter item type"
          />
        </div>
        <div>
          <label htmlFor="color">Color:</label>
          <input
            className="p-2 bg-gray-100 w-full"
            type="text"
            name="color"
            placeholder="Enter item color"
          />
        </div>
        <div>
          <label htmlFor="size">Size:</label>
          <input
            className="p-2 bg-gray-100 w-full"
            type="text"
            name="size"
            placeholder="Enter item size"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="is_for_sale">For Sale:</label>
          <input type="checkbox" name="is_for_sale" />
        </div>
        <div>
          <label htmlFor="clothing-item">Choose a picture:</label>

          <input
            type="file"
            id="clothing-item"
            name="clothing-item"
            accept="image/png, image/jpeg"
          />
        </div>
      </div>
      <div>
        <button className="mt-6 ml-auto py-2 px-4 bg-green-300 cursor-pointer hover:bg-green-400 transition-all ease-in-out font-bold rounded">
          Add Item
        </button>
        <button
          onClick={() => {
            setAddingItem(false);
          }}
          className="mt-6 ml-4 py-2 px-4 bg-red-300 cursor-pointer hover:bg-red-400 transition-all ease-in-out font-bold rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
