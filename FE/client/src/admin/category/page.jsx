import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./category.css";

const CategoryRow = ({ category, expanded, toggleExpand, t }) => {
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
              {expanded ? "▼" : "▶"}
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
      </tr>

      {expanded && category.children?.length > 0 && (
        <tr className="child-row">
          <td colSpan="3" style={{ padding: 0 }}>
            <table className="child-table-category">
                <colgroup>
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "50%" }} />
                    <col style={{ width: "30%" }} />
                </colgroup>
              <thead>
                <tr>
                  <th>{t("categoryId", "Category ID")}</th>
                  <th>{t("name", "Name")}</th>
                  <th>{t("image", "Image")}</th>
                </tr>
              </thead>
              <tbody>
                {category.children.map((child) => (
                  <tr key={child.idCategory}>
                    <td>{child.idCategory}</td>
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
                  </tr>
                ))}
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
          "http://localhost:5000/api/categories/hierarchy"
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

  return (
    <>
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
                <col style={{ width: "50%" }} />
                <col style={{ width: "30%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>{t("categoryId", "Category ID")}</th>
                <th>{t("name", "Name")}</th>
                <th>{t("image", "Image")}</th>
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
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
