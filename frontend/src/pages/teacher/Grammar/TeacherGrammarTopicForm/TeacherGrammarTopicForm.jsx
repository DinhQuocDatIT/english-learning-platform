import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSave,
  faSpinner,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../services/grammarService";
import { slugify } from "../../../../constants/grammarConstants";
import Loading from "../../../../components/common/Loading/Loading";
import styles from "./TeacherGrammarTopicForm.module.css";

function TeacherGrammarTopicForm() {
  const navigate = useNavigate();
  const { roadmapId, topicId } = useParams();

  const isEdit = !!topicId;

  const [form, setForm] = useState({
    roadmapId: Number(roadmapId),
    name: "",
    slug: "",
    description: "",
    displayOrder: 0,
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) fetchTopicDetail();
  }, [topicId, roadmapId]);

  const fetchTopicDetail = async () => {
    try {
      setLoading(true);
      const res = await grammarService.getTopicForEdit(topicId);
      const d = res?.data?.data;
      setForm({
        roadmapId: Number(roadmapId),
        name: d.name || "",
        slug: d.slug || "",
        description: d.description || "",
        displayOrder: d.displayOrder || 0,
      });
    } catch (e) {
      toast.error("Không thể tải chủ điểm.");
      navigate(`/dashboard/teacher/grammar/roadmaps/${roadmapId}/topics`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNameChange = (value) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: isEdit ? prev.slug : slugify(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.warning("Vui lòng nhập tên chủ điểm.");
      return;
    }
    if (!form.slug.trim()) {
      toast.warning("Vui lòng nhập slug.");
      return;
    }

    try {
      setSubmitting(true);
      if (isEdit) {
        await grammarService.updateTopic(topicId, form);
        toast.success("Cập nhật chủ điểm thành công!");
      } else {
        await grammarService.createTopic(form);
        toast.success("Tạo chủ điểm thành công!");
      }
      navigate(`/dashboard/teacher/grammar/roadmaps/${roadmapId}/topics`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể lưu chủ điểm.");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== LOADING =====
  if (loading) {
    return <Loading size="large" text="Đang tải chủ điểm..." />;
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.backBtn}
        onClick={() =>
          navigate(`/dashboard/teacher/grammar/roadmaps/${roadmapId}/topics`)
        }
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Quay lại</span>
      </button>

      <div className={styles.header}>
        <h1>{isEdit ? "Sửa chủ điểm" : "Thêm chủ điểm mới"}</h1>
        <p>Điền thông tin cơ bản cho chủ điểm ngữ pháp.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.grid}>
          {/* NAME */}
          <div className={styles.field}>
            <label>
              Tên chủ điểm <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="VD: Từ loại trong TOEIC (Parts of Speech)"
              maxLength={200}
            />
          </div>

          {/* SLUG */}
          <div className={styles.field}>
            <label>
              Slug <span className={styles.required}>*</span>
              <button
                type="button"
                className={styles.slugBtn}
                onClick={() => handleChange("slug", slugify(form.name))}
                title="Tạo slug từ tên"
              >
                <FontAwesomeIcon icon={faWandMagicSparkles} />
              </button>
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              placeholder="tu-loai-trong-toeic"
              maxLength={200}
            />
            <small>Slug phải là duy nhất, dùng cho URL.</small>
          </div>

          {/* ORDER */}
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

        {/* DESCRIPTION */}
        <div className={styles.field}>
          <label>Mô tả</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Mô tả ngắn về chủ điểm này..."
            maxLength={1000}
          />
        </div>

        {/* ACTIONS */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() =>
              navigate(
                `/dashboard/teacher/grammar/roadmaps/${roadmapId}/topics`,
              )
            }
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
            <span>{isEdit ? "Cập nhật" : "Tạo chủ điểm"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default TeacherGrammarTopicForm;
