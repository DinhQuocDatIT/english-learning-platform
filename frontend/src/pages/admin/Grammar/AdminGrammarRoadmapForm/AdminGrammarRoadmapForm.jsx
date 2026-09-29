import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSave,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../services/grammarService";
import styles from "./AdminGrammarRoadmapForm.module.css";

const COLOR_PRESETS = [
  { value: "#3b82f6", label: "Xanh dương" },
  { value: "#f59e0b", label: "Vàng cam" },
  { value: "#8b5cf6", label: "Tím" },
  { value: "#0ea792", label: "Xanh ngọc" },
  { value: "#dc2626", label: "Đỏ" },
  { value: "#16a34a", label: "Xanh lá" },
];

function AdminGrammarRoadmapForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: "",
    subtitle: "",
    level: 1,
    levelLabel: "",
    description: "",
    color: "#0ea792",
    displayOrder: 0,
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await grammarService.adminGetRoadmapById(id);
      const d = res?.data?.data;
      if (d) {
        setForm({
          name: d.name || "",
          subtitle: d.subtitle || "",
          level: d.level || 1,
          levelLabel: d.levelLabel || "",
          description: d.description || "",
          color: d.color || "#0ea792",
          displayOrder: d.displayOrder || 0,
        });
      }
    } catch (e) {
      toast.error("Không thể tải lộ trình.");
      navigate("/dashboard/admin/grammar");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.warning("Vui lòng nhập tên lộ trình.");
      return;
    }

    try {
      setSubmitting(true);
      if (isEdit) {
        await grammarService.adminUpdateRoadmap(id, form);
        toast.success("Cập nhật lộ trình thành công!");
      } else {
        await grammarService.adminCreateRoadmap(form);
        toast.success("Tạo lộ trình thành công!");
      }
      navigate("/dashboard/admin/grammar");
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể lưu lộ trình.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingBox}>
          <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.backBtn}
        onClick={() => navigate("/dashboard/admin/grammar")}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Quay lại</span>
      </button>

      <div className={styles.header}>
        <h1>{isEdit ? "Sửa lộ trình" : "Thêm lộ trình mới"}</h1>
        <p>
          Điền thông tin cho lộ trình học ngữ pháp. Sau khi tạo, bạn có thể thêm
          chủ điểm.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.grid}>
          {/* NAME */}
          <div className={styles.field}>
            <label>
              Tên lộ trình <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="VD: TOEIC 600, IELTS 6.5..."
              maxLength={100}
            />
          </div>

          {/* SUBTITLE */}
          <div className={styles.field}>
            <label>Phụ đề (Subtitle)</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => handleChange("subtitle", e.target.value)}
              placeholder="VD: NỀN TẢNG VỮNG CHẮC"
              maxLength={100}
            />
          </div>

          {/* LEVEL */}
          <div className={styles.field}>
            <label>Cấp độ (số)</label>
            <input
              type="number"
              value={form.level}
              onChange={(e) => handleChange("level", Number(e.target.value))}
              min={1}
              max={10}
            />
            <small>1 = Cơ bản, 2 = Trung cấp, 3 = Nâng cao</small>
          </div>

          {/* LEVEL LABEL */}
          <div className={styles.field}>
            <label>Nhãn cấp độ</label>
            <input
              type="text"
              value={form.levelLabel}
              onChange={(e) => handleChange("levelLabel", e.target.value)}
              placeholder="VD: Cấp độ 1 - Cơ bản"
              maxLength={50}
            />
          </div>

          {/* DISPLAY ORDER */}
          <div className={styles.field}>
            <label>Thứ tự hiển thị</label>
            <input
              type="number"
              value={form.displayOrder}
              onChange={(e) =>
                handleChange("displayOrder", Number(e.target.value))
              }
              min={0}
            />
          </div>
        </div>

        {/* COLOR */}
        <div className={styles.field}>
          <label>Màu sắc</label>
          <div className={styles.colorGrid}>
            {COLOR_PRESETS.map((c) => (
              <button
                key={c.value}
                type="button"
                className={`${styles.colorBtn} ${
                  form.color === c.value ? styles.colorActive : ""
                }`}
                style={{ "--c": c.value }}
                onClick={() => handleChange("color", c.value)}
                title={c.label}
              >
                <span className={styles.colorDot} />
                <span className={styles.colorLabel}>{c.label}</span>
              </button>
            ))}
          </div>
          <div className={styles.colorPreview}>
            <span className={styles.previewLabel}>Xem trước:</span>
            <div
              className={styles.previewStripe}
              style={{ background: form.color }}
            />
            <span className={styles.previewText} style={{ color: form.color }}>
              {form.name || "Tên lộ trình"}
            </span>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className={styles.field}>
          <label>Mô tả</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Mô tả ngắn về lộ trình này..."
            maxLength={1000}
          />
        </div>

        {/* ACTIONS */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => navigate("/dashboard/admin/grammar")}
          >
            Hủy
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faSave} />
            )}
            <span>{isEdit ? "Cập nhật" : "Tạo lộ trình"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminGrammarRoadmapForm;
