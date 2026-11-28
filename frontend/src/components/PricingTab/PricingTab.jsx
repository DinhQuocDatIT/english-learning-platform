// frontend/src/pages/admin/AIUsage/components/PricingTab.jsx

import React, { useState } from "react";
import {
  faDollarSign,
  faPlus,
  faLock,
  faCheckCircle,
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
import Loading from "../common/Loading/Loading";
import styles from "./PricingTab.module.css";

// ✅ Cố định cho demo: chỉ dùng 1 provider + 1 model
const FIXED_PROVIDER = "GEMINI";
const FIXED_MODEL = "gemini-3.5-flash-lite";
const FIXED_MODEL_LABEL = "Gemini 3.5 Flash Lite";

function PricingTab({ pricings, loading, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
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
        provider: FIXED_PROVIDER,
        model: FIXED_MODEL,
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

  const isFixedModelActive = () => {
    return pricings.some(
      (p) =>
        p.provider === FIXED_PROVIDER && p.model === FIXED_MODEL && p.isActive,
    );
  };

  if (loading) {
    return (
      <Loading
        size="large"
        fullScreen={false}
        text="Đang tải danh sách giá..."
      />
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
              Quản lý bảng giá cho mô hình AI
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

            {isFixedModelActive() && (
              <div className={styles.modalWarning}>
                <FontAwesomeIcon icon={faTriangleExclamation} />
                <div>
                  <strong>Model này đang active!</strong>
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

            <form onSubmit={handleSubmitPricing} className={styles.form}>
              {/* Model info card */}
              <div className={styles.modelCard}>
                <div className={styles.modelCardIcon}>
                  <FontAwesomeIcon icon={faRobot} />
                </div>
                <div className={styles.modelCardInfo}>
                  <span className={styles.modelCardProvider}>
                    {FIXED_PROVIDER}
                  </span>
                  <span className={styles.modelCardName}>
                    {FIXED_MODEL_LABEL}
                  </span>
                  <code className={styles.modelCardCode}>{FIXED_MODEL}</code>
                </div>
              </div>

              {/* Price inputs */}
              <div className={styles.priceInputs}>
                <div className={styles.priceField}>
                  <label>Giá Input</label>
                  <div className={styles.priceInputWrapper}>
                    <span className={styles.pricePrefix}>$</span>
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
                      disabled={isFixedModelActive()}
                    />
                    <span className={styles.priceSuffix}>/ 1M</span>
                  </div>
                </div>

                <div className={styles.priceField}>
                  <label>Giá Output</label>
                  <div className={styles.priceInputWrapper}>
                    <span className={styles.pricePrefix}>$</span>
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
                      disabled={isFixedModelActive()}
                    />
                    <span className={styles.priceSuffix}>/ 1M</span>
                  </div>
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
                  disabled={isFixedModelActive()}
                >
                  <FontAwesomeIcon icon={faPlus} />
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
