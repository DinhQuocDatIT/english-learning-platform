// frontend/src/pages/admin/AIUsage/components/PricingTab.jsx
import React, { useState } from "react";
import {
  faDollarSign,
  faPlus,
  faTrash,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import pricingService from "../../services/pricingService";
import styles from "./PricingTab.module.css";

// Danh sách model theo Provider
const MODEL_LIST = {
  GEMINI: [
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash Lite" },
    { value: "gemini-3.5-flash", label: "Gemini 3.5 Flash" },
    { value: "gemini-3.5-pro", label: "Gemini 3.5 Pro" },
  ],
  OPENAI: [
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ],
  CLAUDE: [
    { value: "claude-3-opus", label: "Claude 3 Opus" },
    { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
    { value: "claude-3-haiku", label: "Claude 3 Haiku" },
    { value: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  ],
};

function PricingTab({ pricings, loading, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    provider: "GEMINI",
    model: "",
    inputPricePerMillion: "",
    outputPricePerMillion: "",
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const handleAddPricing = () => {
    setFormData({
      provider: "GEMINI",
      model: "",
      inputPricePerMillion: "",
      outputPricePerMillion: "",
    });
    setShowModal(true);
  };

  const handleDeletePricing = async (id, isInUse, modelName) => {
    let confirmMessage = "Bạn có chắc muốn vô hiệu hóa pricing này?";
    if (isInUse) {
      confirmMessage = `⚠️ CẢNH BÁO: Model "${modelName}" đang được sử dụng!\n\nVô hiệu hóa sẽ khiến học viên không thể sử dụng model này nữa.\n\nBạn có chắc muốn tiếp tục?`;
    }

    if (!window.confirm(confirmMessage)) return;

    try {
      await pricingService.deactivate(id);
      toast.success(
        isInUse
          ? `✅ Đã vô hiệu hóa model "${modelName}". Học viên sẽ không dùng được model này nữa.`
          : "Đã vô hiệu hóa pricing",
      );
      onRefresh();
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error(
        error.response?.data?.message || "Không thể vô hiệu hóa pricing",
      );
    }
  };

  const handleSubmitPricing = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        inputPricePerMillion: parseFloat(formData.inputPricePerMillion),
        outputPricePerMillion: parseFloat(formData.outputPricePerMillion),
        effectiveFrom: new Date().toISOString(),
      };

      await pricingService.create(payload);
      toast.success("Tạo pricing thành công");

      setShowModal(false);
      onRefresh();
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const getModelsByProvider = (provider) => {
    return MODEL_LIST[provider] || [];
  };

  const isModelActive = (provider, model) => {
    return pricings.some(
      (p) => p.provider === provider && p.model === model && p.isActive,
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin />
        <p>Đang tải danh sách giá...</p>
      </div>
    );
  }

  return (
    <div className={styles.pricingContainer}>
      <div className={styles.pricingHeader}>
        <h2 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faDollarSign} />
          Quản lý giá AI Model
        </h2>
        <button className={styles.addBtn} onClick={handleAddPricing}>
          <FontAwesomeIcon icon={faPlus} />
          Thêm giá mới
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.pricingTable}>
          <thead>
            <tr>
              <th>Provider</th>
              <th>Model</th>
              <th>Giá Input (1M)</th>
              <th>Giá Output (1M)</th>
              <th>Đang áp dụng</th>
              <th>Đang dùng</th>
              <th>Hiệu lực từ</th>
              <th>Hết hiệu lực</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pricings && pricings.length > 0 ? (
              pricings.map((pricing) => (
                <tr key={pricing.id}>
                  <td>
                    <span className={styles.providerBadge}>
                      {pricing.provider}
                    </span>
                  </td>
                  <td>
                    <span className={styles.modelBadge}>{pricing.model}</span>
                  </td>
                  <td>${pricing.inputPricePerMillion}</td>
                  <td>${pricing.outputPricePerMillion}</td>
                  <td>
                    {pricing.isActive ? (
                      <span className={styles.statusActive}>
                        <FontAwesomeIcon icon={faCheckCircle} /> Đang áp dụng
                      </span>
                    ) : (
                      <span className={styles.statusInactive}>
                        <FontAwesomeIcon icon={faTimesCircle} /> Hết hiệu lực
                      </span>
                    )}
                  </td>
                  <td>
                    {pricing.isInUse ? (
                      <span className={styles.inUseBadge}>
                        <FontAwesomeIcon icon={faExclamationTriangle} /> Đang
                        dùng
                      </span>
                    ) : (
                      <span className={styles.notInUseBadge}>-</span>
                    )}
                  </td>
                  <td>{formatDate(pricing.effectiveFrom)}</td>
                  <td>
                    {pricing.effectiveTo ? (
                      formatDate(pricing.effectiveTo)
                    ) : (
                      <span className={styles.activeBadge}>Đang áp dụng</span>
                    )}
                  </td>
                  <td>
                    {pricing.isActive && (
                      <button
                        className={
                          pricing.isInUse
                            ? styles.deleteBtnWarning
                            : styles.deleteBtn
                        }
                        onClick={() =>
                          handleDeletePricing(
                            pricing.id,
                            pricing.isInUse,
                            pricing.model,
                          )
                        }
                        title={
                          pricing.isInUse
                            ? "⚠️ Model đang được sử dụng!"
                            : "Vô hiệu hóa"
                        }
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        {pricing.isInUse && (
                          <span className={styles.warningIcon}>⚠️</span>
                        )}
                      </button>
                    )}
                    {!pricing.isActive && (
                      <span className={styles.inactiveAction}>-</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className={styles.noData}>
                  Chưa có dữ liệu pricing
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal - Thêm Pricing */}
      {showModal && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Thêm giá mới</h2>
              <button
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            {formData.model &&
              isModelActive(formData.provider, formData.model) && (
                <div className={styles.modalWarning}>
                  <FontAwesomeIcon icon={faTimesCircle} />
                  <div>
                    <strong>❌ Model này đang active!</strong>
                    <p>Vui lòng vô hiệu hóa pricing cũ trước khi thêm mới.</p>
                    <button
                      className={styles.goToDeleteBtn}
                      onClick={() => {
                        setShowModal(false);
                        setTimeout(() => {
                          document
                            .querySelector(".pricingTable")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }, 300);
                      }}
                    >
                      Đi đến danh sách để vô hiệu hóa
                    </button>
                  </div>
                </div>
              )}

            <form onSubmit={handleSubmitPricing}>
              <div className={styles.formGroup}>
                <label>Provider</label>
                <select
                  value={formData.provider}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      provider: e.target.value,
                      model: "",
                    })
                  }
                >
                  <option value="GEMINI">GEMINI</option>
                  <option value="OPENAI">OPENAI</option>
                  <option value="CLAUDE">CLAUDE</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Model</label>
                <select
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  required
                >
                  <option value="">-- Chọn model --</option>
                  {getModelsByProvider(formData.provider).map((model) => {
                    const active = isModelActive(
                      formData.provider,
                      model.value,
                    );
                    return (
                      <option key={model.value} value={model.value}>
                        {model.label} {active ? "(⚠️ Đang active)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Giá Input (USD/1M tokens)</label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="VD: 0.10"
                  value={formData.inputPricePerMillion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      inputPricePerMillion: e.target.value,
                    })
                  }
                  required
                  disabled={
                    formData.model &&
                    isModelActive(formData.provider, formData.model)
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>Giá Output (USD/1M tokens)</label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="VD: 0.30"
                  value={formData.outputPricePerMillion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      outputPricePerMillion: e.target.value,
                    })
                  }
                  required
                  disabled={
                    formData.model &&
                    isModelActive(formData.provider, formData.model)
                  }
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={
                    formData.model &&
                    isModelActive(formData.provider, formData.model)
                  }
                >
                  Thêm mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PricingTab;
