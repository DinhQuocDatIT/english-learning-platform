// frontend/src/pages/admin/AIUsage/components/PricingTab.jsx
import React, { useState } from "react";
import {
  faDollarSign,
  faPlus,
  faLock,
  faUnlock,
  faSpinner,
  faCheckCircle,
  faBan,
  faTriangleExclamation,
  faXmark,
  faArrowRight,
  faRobot,
  faClock,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import pricingService from "../../services/pricingService";
import styles from "./PricingTab.module.css";

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
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

  const handleDeactivatePricing = async (id, isInUse, modelName) => {
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
        <FontAwesomeIcon icon={faSpinner} spin className={styles.spinnerIcon} />
        <p>Đang tải danh sách giá...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faDollarSign} />
          </div>
          <div>
            <h2 className={styles.title}>Quản lý AI Model</h2>
            <p className={styles.subtitle}>
              <FontAwesomeIcon icon={faRobot} className={styles.subIcon} />
              Quản lý bảng giá cho các mô hình AI theo từng nhà cung cấp
            </p>
          </div>
        </div>
        <button className={styles.addBtn} onClick={handleAddPricing}>
          <FontAwesomeIcon icon={faPlus} />
          Thêm giá mới
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nhà cung cấp</th>
              <th>Mô hình</th>
              <th className={styles.priceCol}>Giá Input</th>
              <th className={styles.priceCol}>Giá Output</th>
              <th>Trạng thái</th>
              <th>Sử dụng</th>
              <th>Hiệu lực</th>
              <th className={styles.actionCol}></th>
            </tr>
          </thead>
          <tbody>
            {pricings && pricings.length > 0 ? (
              pricings.map((pricing) => (
                <tr
                  key={pricing.id}
                  className={
                    pricing.isActive ? styles.activeRow : styles.inactiveRow
                  }
                >
                  <td>
                    <span className={styles.providerChip}>
                      {pricing.provider}
                    </span>
                  </td>
                  <td>
                    <span className={styles.modelChip}>{pricing.model}</span>
                  </td>
                  <td className={styles.priceCell}>
                    <span className={styles.priceValue}>
                      ${pricing.inputPricePerMillion}
                    </span>
                    <span className={styles.priceUnit}>/1M</span>
                  </td>
                  <td className={styles.priceCell}>
                    <span className={styles.priceValue}>
                      ${pricing.outputPricePerMillion}
                    </span>
                    <span className={styles.priceUnit}>/1M</span>
                  </td>
                  <td>
                    {pricing.isActive ? (
                      <span className={styles.statusActive}>
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Đang áp dụng
                      </span>
                    ) : (
                      <span className={styles.statusInactive}>
                        <FontAwesomeIcon icon={faLock} />
                        Đã khóa
                      </span>
                    )}
                  </td>
                  <td>
                    {pricing.isInUse ? (
                      <span className={styles.inUseChip}>
                        <FontAwesomeIcon icon={faTriangleExclamation} />
                        Đang dùng
                      </span>
                    ) : (
                      <span className={styles.notInUse}>—</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.effectiveDates}>
                      <div className={styles.dateItem}>
                        <FontAwesomeIcon
                          icon={faCalendar}
                          className={styles.dateIcon}
                        />
                        <span className={styles.dateFrom}>
                          {formatDate(pricing.effectiveFrom)}
                        </span>
                      </div>
                      {pricing.effectiveTo ? (
                        <>
                          <FontAwesomeIcon
                            icon={faArrowRight}
                            className={styles.dateArrow}
                          />
                          <div className={styles.dateItem}>
                            <FontAwesomeIcon
                              icon={faClock}
                              className={styles.dateIcon}
                            />
                            <span className={styles.dateTo}>
                              {formatDate(pricing.effectiveTo)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className={styles.activeDateChip}>
                          Đang áp dụng
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={styles.actionCol}>
                    {pricing.isActive ? (
                      <button
                        className={
                          pricing.isInUse
                            ? styles.lockBtnDanger
                            : styles.lockBtn
                        }
                        onClick={() =>
                          handleDeactivatePricing(
                            pricing.id,
                            pricing.isInUse,
                            pricing.model,
                          )
                        }
                        title={
                          pricing.isInUse
                            ? "⚠️ Model đang được sử dụng! Vô hiệu hóa sẽ ảnh hưởng đến học viên."
                            : "Vô hiệu hóa"
                        }
                      >
                        <FontAwesomeIcon icon={faLock} />
                      </button>
                    ) : (
                      <span className={styles.inactiveAction}>
                        <FontAwesomeIcon
                          icon={faLock}
                          className={styles.lockedIcon}
                        />
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className={styles.noData}>
                  <div className={styles.noDataContent}>
                    <FontAwesomeIcon
                      icon={faDollarSign}
                      className={styles.noDataIcon}
                    />
                    <span>Chưa có dữ liệu pricing</span>
                    <span className={styles.noDataSub}>
                      Hãy thêm bảng giá mới
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <div className={styles.modalIconWrapper}>
                  <FontAwesomeIcon icon={faPlus} />
                </div>
                <h3>Thêm giá mới</h3>
              </div>
              <button
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {formData.model &&
              isModelActive(formData.provider, formData.model) && (
                <div className={styles.modalWarning}>
                  <FontAwesomeIcon icon={faTriangleExclamation} />
                  <div>
                    <strong>❌ Model này đang active!</strong>
                    <p>Vui lòng vô hiệu hóa pricing cũ trước khi thêm mới.</p>
                    <button
                      className={styles.goToDeleteBtn}
                      onClick={() => {
                        setShowModal(false);
                        setTimeout(() => {
                          document
                            .querySelector(`.${styles.table}`)
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
                <label>Nhà cung cấp</label>
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
                <label>Mô hình</label>
                <select
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  required
                >
                  <option value="">— Chọn model —</option>
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

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Giá Input (USD/1M)</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.00"
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
                  <label>Giá Output (USD/1M)</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.00"
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
