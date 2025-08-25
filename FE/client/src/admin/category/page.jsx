import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./category.css";

const CategoryRow = ({ category, expanded, toggleExpand, t, setCurrentParentId, setShowForm, onEdit }) => {
  return (
    <>
      <tr>
        <td>
          {category.children?.length > 0 && (
            <button
                className="dropdown-btn"
                style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
                color: "#444"
                }}
              onClick={() => toggleExpand(category.idCategory)}
            >
              {expanded ? t("collapse", "▼") : t("expand", "▶")}
            </button>
          )}
          {category.idCategory}
        </td>
        <td>{category.name}</td>
        <td>
          <img
            src={category.image}
            alt={category.name}
            style={{ width: "50px", height: "50px", objectFit: "cover" }}
          />
        </td>
        <td>
          <button
            className="action-button  action-edit"
            onClick={() => onEdit(category)} 
          >
            {t("edit", "Edit")}
          </button>
        </td>
      </tr>

      {expanded && category.children?.length > 0 && (
        <tr className="child-row">
          <td colSpan="4" style={{ padding: 0 }}>
            <table className="child-table-category">
                <colgroup>
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "40%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "20%" }} />
                </colgroup>
              <thead>
                <tr>
                  <th style={{padding: "0 0 0 10px"}}>{t("categoryId", "Category ID")}</th>
                  <th>{t("name", "Name")}</th>
                  <th>{t("image", "Image")}</th>
                  <th>{t("action", "Actions")}</th> 
                </tr>
              </thead>
              <tbody>
                {category.children.map((child) => (
                  <tr key={child.idCategory}>
                    <td style={{padding: "0 0 0 40px"}}>{child.idCategory}</td>
                    <td>{child.name}</td>
                    <td>
                      <img
                        src={child.image}
                        alt={child.name}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                    </td>
                    <td>
                      <button
                        className="action-button  action-edit-child"
                        onClick={() => onEdit(child)}
                      >
                        {t("edit", "Edit")}
                      </button>
                    </td>
                  </tr>
                ))}

                <tr
                  className="add-category-row"
                  style={{ cursor: "pointer", textAlign: "center" }}
                  onClick={() => {
                    setCurrentParentId(category.idCategory); // set parent
                    setShowForm(true);
                  }}
                >
                  <td colSpan="4" style={{ fontSize: "16px", color: "#2196F3", textAlign: "center" }}>
                    {t("addChildCategory", "+ Add child category")}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
};

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState("");
  const [currentParentId, setCurrentParentId] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");

  const { t } = useTranslation();

  const toggleExpand = (categoryId) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/categories/hierarchy`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch");
        if (!Array.isArray(data.data))
          throw new Error("Unexpected API format");
        setCategories(data.data);
      } catch (err) {
        setError(err.message || "Error fetching categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categoriesManagement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameCategory: newName, 
          image: newImage,
          parentID: currentParentId 
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create category");

      setCategories((prev) => [...prev, data.data]); 
      setShowForm(false);
      setNewName("");
      setNewImage("");
      setCurrentParentId(null);
    } catch (err) {
      setError(err.message || "Error creating category");
    }
  };

  const handleUpdateCategory = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categoriesManagement/${editingCategory.idCategory}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameCategory: editName,
          image: editImage
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update category");

      setCategories((prev) =>
        prev.map((cat) =>
          cat.idCategory === editingCategory.idCategory
            ? { ...cat, name: editName, image: editImage }
            : cat
        )
      );

      setEditingCategory(null);
    } catch (err) {
      setError(err.message || "Error updating category");
    }
  };

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h1 className="page-title">
        {t("categoryManagement", "Category Management")}
      </h1>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : categories.length === 0 ? (
        <div className="no-orders">{t("noCategories", "No categories found.")}</div>
      ) : (
        <div className="table-wrapper">
          <table className="orders-table">
            <colgroup>
                <col style={{ width: "20%" }} />
                <col style={{ width: "40%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "20%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>{t("categoryId", "Category ID")}</th>
                <th>{t("name", "Name")}</th>
                <th>{t("image", "Image")}</th>
                <th>{t("action", "Actions")}</th> 
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <CategoryRow
                  key={category.idCategory}
                  category={category}
                  expanded={expandedCategories.includes(category.idCategory)}
                  toggleExpand={toggleExpand}
                  t={t}
                  setCurrentParentId={setCurrentParentId}
                  setShowForm={setShowForm}
                  onEdit={(cat) => {
                    setEditingCategory(cat);
                    setEditName(cat.name);
                    setEditImage(cat.image);
                  }}
                />
              ))}

              <tr
                className="add-category-row"
                style={{ cursor: "pointer", textAlign: "center" }}
                onClick={() => {
                  setCurrentParentId(null);
                  setShowForm(true);
                }}
              >
                <td colSpan="4" style={{ fontSize: "16px", color: "#4CAF50", textAlign: "center" }}>
                  {t("addParentCategory", "+ Add new parent category")}
                </td>
              </tr>

              {showForm && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h3>
                      <strong>
                        {currentParentId
                          ? t("addNewChildCategory", "Add New Child Category")
                          : t("addNewParentCategory", "Add New Parent Category")}
                      </strong>
                    </h3>
                    <label htmlFor="category-image-upload" style={{ fontWeight: 500, marginBottom: 8 }}>{t("addName", "Add Name")}</label>
                    <input
                      type="text"
                      placeholder={t("categoryName", "Category Name")}
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                    <div className="image-upload-section">
                      <label htmlFor="category-image-upload" style={{ fontWeight: 500, marginBottom: 8 }}>{t("addImage", "Add Image")}</label>
                      <div className="upload-area" style={{ marginBottom: 12 }}
                        onDrop={e => {
                          e.preventDefault();
                          const files = e.dataTransfer.files;
                          if (files.length > 0) {
                            alert('Drag & drop upload for category image is not implemented yet.');
                          }
                        }}
                        onDragOver={e => e.preventDefault()}
                      >
                        <div className="upload-placeholder">
                          <div className="upload-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21,15 16,10 5,21"/>
                            </svg>
                          </div>
                          <div className="upload-text">
                            <span>{t("dropImageHere", "Drop your image here, or ")}</span>
                            <label htmlFor="category-image-upload" className="browse-link">{t("browse", "Browse")}</label>
                          </div>
                        </div>
                        <input
                          type="file"
                          id="category-image-upload"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={e => {
                            alert('Browse upload for category image is not implemented yet.');
                          }}
                        />
                      </div>
                    </div>
                    <div className="modal-buttons">
                      <button onClick={handleAddCategory}>{t("add", "Add")}</button>
                      <button onClick={() => setShowForm(false)}>{t("cancel", "Cancel")}</button>
                    </div>
                  </div>
                </div>
              )}

              {editingCategory && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h3><strong>{t("editCategory", "Edit Category")} (ID: {editingCategory.idCategory})</strong></h3>
                    <label htmlFor="edit-category-image-upload" style={{ fontWeight: 500, marginBottom: 8 }}>{t("editName", "Edit Name")}</label>
                    <input
                      type="text"
                      placeholder={t("categoryName", "Category Name")}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <div className="image-upload-section">
                      <label htmlFor="edit-category-image-upload" style={{ fontWeight: 500, marginBottom: 8 }}>{t("editImage", "Edit Image")}</label>
                      <div className="upload-area" style={{ marginBottom: 12 }}
                        onDrop={e => {
                          e.preventDefault();
                          const files = e.dataTransfer.files;
                          if (files.length > 0) {
                            alert('Drag & drop upload for category image is not implemented yet.');
                          }
                        }}
                        onDragOver={e => e.preventDefault()}
                      >
                        <div className="upload-placeholder">
                          <div className="upload-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21,15 16,10 5,21"/>
                            </svg>
                          </div>
                          <div className="upload-text">
                            <span>{t("dropImageHere", "Drop your image here, or ")}</span>
                            <label htmlFor="edit-category-image-upload" className="browse-link">{t("browse", "Browse")}</label>
                          </div>
                        </div>
                        <input
                          type="file"
                          id="edit-category-image-upload"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={e => {
                            alert('Browse upload for category image is not implemented yet.');
                          }}
                        />
                      </div>
                    </div>
                    <div className="modal-buttons">
                      <button onClick={handleUpdateCategory}>{t("save", "Save")}</button>
                      <button onClick={() => setEditingCategory(null)}>{t("cancel", "Cancel")}</button>
                    </div>
                  </div>
                </div>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
