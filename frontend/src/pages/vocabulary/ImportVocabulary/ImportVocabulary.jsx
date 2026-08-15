import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Papa from "papaparse";
import styles from "./ImportVocabulary.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowUp,
  faDownload,
  faFileCsv,
  faLanguage,
  faBookOpen,
  faCircleCheck,
  faCircleExclamation,
  faXmark,
  faList,
  faCopy,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import vocabulary from "../../../services/vocabularyService";

function ImportVocabulary() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [stats, setStats] = useState({
    totalRows: 0,
    uniqueWords: 0,
    totalMeanings: 0,
  });
  const [errors, setErrors] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const requiredHeaders = [
    "word",
    "pronunciation",
    "partOfSpeech",
    "meaning",
    "example",
  ];

  const processFile = (selectedFile) => {
    if (!selectedFile) return;
    setErrors([]);
    setImportResult(null);

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setErrors(["Chỉ hỗ trợ file CSV."]);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrors(["Dung lượng file không được vượt quá 5MB."]);
      return;
    }

    setFile(selectedFile);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        const headers = results.meta.fields || [];
        const missingHeaders = requiredHeaders.filter(
          (header) => !headers.includes(header),
        );

        if (missingHeaders.length > 0) {
          setErrors([`File thiếu cột: ${missingHeaders.join(", ")}`]);
          setPreviewData([]);
          setStats({
            totalRows: 0,
            uniqueWords: 0,
            totalMeanings: 0,
          });
          return;
        }

        const rowErrors = [];
        data.forEach((row, index) => {
          const rowNumber = index + 2;
          if (!row.word?.trim()) {
            rowErrors.push(`Dòng ${rowNumber}: Word không được để trống.`);
          }
          if (!row.meaning?.trim()) {
            rowErrors.push(`Dòng ${rowNumber}: Meaning không được để trống.`);
          }
          if (!row.partOfSpeech?.trim()) {
            rowErrors.push(
              `Dòng ${rowNumber}: Part of Speech không được để trống.`,
            );
          }
        });

        setErrors(rowErrors);
        setPreviewData(
          data.slice(0, 10).map((item, index) => ({
            id: index + 1,
            word: item.word || "",
            pronunciation: item.pronunciation || "",
            partOfSpeech: item.partOfSpeech || "",
            meaning: item.meaning || "",
            example: item.example || "",
          })),
        );

        const uniqueWords = new Set(
          data.map((item) => item.word?.trim().toLowerCase()).filter(Boolean),
        );
        const totalMeanings = data.filter((item) =>
          item.meaning?.trim(),
        ).length;

        setStats({
          totalRows: data.length,
          uniqueWords: uniqueWords.size,
          totalMeanings,
        });
      },
      error: () => {
        setErrors(["Không thể đọc file CSV. Vui lòng kiểm tra lại file."]);
      },
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    processFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    processFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewData([]);
    setStats({
      totalRows: 0,
      uniqueWords: 0,
      totalMeanings: 0,
    });
    setErrors([]);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!file) {
      setErrors(["Vui lòng chọn file CSV trước khi import."]);
      return;
    }

    if (errors.length > 0) {
      setErrors([
        "File đang có lỗi. Vui lòng sửa file trước khi import.",
        ...errors,
      ]);
      return;
    }

    try {
      setIsImporting(true);
      setImportResult(null);
      const response = await vocabulary.importCsv(file);
      setImportResult(response.data?.data || response.data);
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.message || "Import từ vựng thất bại.";
      setErrors([message]);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = [
      "word,pronunciation,partOfSpeech,meaning,example",
      'run,/rʌn/,verb,"chạy","I run every morning."',
      'run,/rʌn/,verb,"vận hành","He runs a company."',
      'happy,/ˈhæpi/,adjective,"vui vẻ","She is very happy."',
      'abandon,/əˈbændən/,verb,"từ bỏ, bỏ rơi","They abandoned the plan."',
      'achieve,/əˈtʃiːv/,verb,"đạt được","She achieved her goal."',
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "vocabulary-template.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // Render kết quả import chi tiết
  const renderImportResult = () => {
    if (!importResult) return null;

    const {
      totalRows,
      successCount,
      duplicateCount,
      errorCount,
      errors,
      duplicates,
    } = importResult;
    const hasSuccess = successCount > 0;
    const hasDuplicates = duplicateCount > 0;
    const hasErrors = errorCount > 0;

    return (
      <div className={styles.resultContainer}>
        {/* Header kết quả */}
        <div className={styles.resultHeader}>
          <div className={styles.resultTitle}>
            <FontAwesomeIcon
              icon={
                hasErrors || hasDuplicates
                  ? faExclamationTriangle
                  : faCheckCircle
              }
              className={
                hasErrors || hasDuplicates
                  ? styles.resultWarning
                  : styles.resultSuccess
              }
            />
            <span>Kết quả import</span>
          </div>
          <div className={styles.resultTime}>
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Thống kê nhanh */}
        <div className={styles.resultStats}>
          <div className={styles.resultStatItem}>
            <span className={styles.statNumber}>{totalRows}</span>
            <span className={styles.statLabel}>Tổng dòng</span>
          </div>
          <div className={`${styles.resultStatItem} ${styles.statSuccess}`}>
            <span className={styles.statNumber}>{successCount}</span>
            <span className={styles.statLabel}>
              <FontAwesomeIcon icon={faCircleCheck} /> Thành công
            </span>
          </div>
          {hasDuplicates && (
            <div className={`${styles.resultStatItem} ${styles.statDuplicate}`}>
              <span className={styles.statNumber}>{duplicateCount}</span>
              <span className={styles.statLabel}>
                <FontAwesomeIcon icon={faCopy} /> Trùng lặp
              </span>
            </div>
          )}
          {hasErrors && (
            <div className={`${styles.resultStatItem} ${styles.statError}`}>
              <span className={styles.statNumber}>{errorCount}</span>
              <span className={styles.statLabel}>
                <FontAwesomeIcon icon={faTimesCircle} /> Lỗi
              </span>
            </div>
          )}
        </div>

        {/* Chi tiết duplicate */}
        {hasDuplicates && duplicates && duplicates.length > 0 && (
          <div className={styles.resultSection}>
            <div className={styles.sectionHeader}>
              <FontAwesomeIcon icon={faCopy} className={styles.duplicateIcon} />
              <span className={styles.sectionTitle}>
                Từ bị trùng lặp ({duplicates.length})
              </span>
              <span className={styles.sectionBadge}>
                {duplicates.length} từ
              </span>
            </div>
            <div className={styles.sectionContent}>
              {duplicates.map((item, index) => (
                <div key={index} className={styles.duplicateItem}>
                  <span className={styles.duplicateIndex}>#{index + 1}</span>
                  <span className={styles.duplicateText}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chi tiết lỗi */}
        {hasErrors && errors && errors.length > 0 && (
          <div className={styles.resultSection}>
            <div className={styles.sectionHeader}>
              <FontAwesomeIcon
                icon={faTimesCircle}
                className={styles.errorIcon}
              />
              <span className={styles.sectionTitle}>Lỗi ({errors.length})</span>
              <span className={styles.sectionBadgeError}>
                {errors.length} lỗi
              </span>
            </div>
            <div className={styles.sectionContent}>
              {errors.map((item, index) => (
                <div key={index} className={styles.errorItem}>
                  <span className={styles.errorIndex}>#{index + 1}</span>
                  <span className={styles.errorText}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Thông báo thành công */}
        {!hasDuplicates && !hasErrors && successCount > 0 && (
          <div className={styles.successMessage}>
            <FontAwesomeIcon icon={faCircleCheck} />
            <span>
              Tất cả {successCount} từ vựng đã được import thành công!
            </span>
          </div>
        )}

        {/* Footer kết quả */}
        <div className={styles.resultFooter}>
          <button
            className={styles.clearResultBtn}
            onClick={() => setImportResult(null)}
          >
            <FontAwesomeIcon icon={faXmark} /> Đóng kết quả
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      {/* Breadcrumb & Tiêu đề */}
      <div className={styles.headerTop}>
        <div className={styles.breadcrumb}>
          <Link to={"/dashboard/admin/vocabulary"}>Quản lý từ vựng</Link>
          <span className={styles.separator}>›</span>
          <span className={styles.currentBreadcrumb}>Import từ vựng</span>
        </div>
        <h1 className={styles.title}>Import từ vựng</h1>
        <p className={styles.subtitle}>
          Nhập hàng loạt từ vựng vào hệ thống bằng file CSV.
        </p>
      </div>

      {/* Layout Grid 2 Cột */}
      <div className={styles.mainLayout}>
        {/* CỘT TRÁI */}
        <div className={styles.leftColumn}>
          {/* Hướng dẫn định dạng */}
          <div className={styles.card}>
            <div className={styles.cardHeaderWithIcon}>
              <span className={styles.infoIcon}>ℹ</span>
              <h2 className={styles.cardTitle}>Hướng dẫn định dạng</h2>
            </div>
            <p className={styles.instructionText}>
              File CSV cần có các cột Header:
            </p>

            <div className={styles.codeTags}>
              {requiredHeaders.map((header) => (
                <span key={header}>{header}</span>
              ))}
            </div>

            <div className={styles.miniTableWrapper}>
              <table className={styles.miniTable}>
                <thead>
                  <tr>
                    <th>word</th>
                    <th>partOfSpeech</th>
                    <th>meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>run</td>
                    <td>verb</td>
                    <td>chạy</td>
                  </tr>
                  <tr>
                    <td>run</td>
                    <td>verb</td>
                    <td>vận hành</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              type="button"
              className={styles.downloadTemplateBtn}
              onClick={handleDownloadTemplate}
            >
              <FontAwesomeIcon icon={faDownload} /> Tải file CSV mẫu
            </button>
          </div>

          {/* Khung Upload File */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle} style={{ marginBottom: "16px" }}>
              Upload File
            </h2>
            <label
              className={`${styles.dropZone} ${dragActive ? styles.dragActive : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <div className={styles.uploadIconCircle}>
                <FontAwesomeIcon icon={faCloudArrowUp} />
              </div>
              <div className={styles.uploadTextGroup}>
                <p className={styles.uploadMainText}>
                  {file ? (
                    `Đã chọn: ${file.name}`
                  ) : (
                    <>Kéo thả file CSV vào đây</>
                  )}
                </p>
                <p className={styles.uploadSubText}>
                  {file
                    ? "Click để thay thế file khác"
                    : "hoặc click để chọn file từ thiết bị"}
                </p>
              </div>
              <span className={styles.uploadNote}>
                Chỉ hỗ trợ file .csv (Max 5MB)
              </span>
            </label>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className={styles.rightColumn}>
          <div className={styles.card}>
            <div className={styles.previewHeader}>
              <h2 className={styles.cardTitle}>Preview dữ liệu</h2>
              {previewData.length > 0 && (
                <span className={styles.badgeRows}>
                  Hiển thị {previewData.length} dòng đầu
                </span>
              )}
            </div>

            {/* Bảng Preview */}
            {previewData.length === 0 ? (
              <div className={styles.emptyPreview}>
                <div>
                  <FontAwesomeIcon icon={faFileCsv} />
                  <p>Chưa có dữ liệu preview</p>
                </div>
                <span>Upload file CSV để xem trước dữ liệu.</span>
              </div>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.previewTable}>
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>STT</th>
                      <th>Word</th>
                      <th>Pronunciation</th>
                      <th>Part of Speech</th>
                      <th>Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row) => {
                      const rowHasError =
                        !row.word || !row.meaning || !row.partOfSpeech;
                      return (
                        <tr key={row.id}>
                          <td className={styles.textMuted}>{row.id}</td>
                          <td
                            className={
                              rowHasError ? styles.textError : styles.textBold
                            }
                          >
                            {row.word || "Missing"}
                          </td>
                          <td className={styles.textMuted}>
                            {row.pronunciation || "-"}
                          </td>
                          <td>
                            <span
                              className={
                                rowHasError
                                  ? styles.tagError
                                  : styles.tagDefault
                              }
                            >
                              {row.partOfSpeech || "Missing"}
                            </span>
                          </td>
                          <td>{row.meaning || "Missing"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Các thẻ thống kê số liệu */}
            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                  <FontAwesomeIcon icon={faFileCsv} />
                </div>
                <div>
                  <span className={styles.statLabel}>Tổng số dòng</span>
                  <div className={styles.statValue}>{stats.totalRows}</div>
                </div>
              </div>

              <div className={styles.statBox}>
                <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                  <FontAwesomeIcon icon={faLanguage} />
                </div>
                <div>
                  <span className={styles.statLabel}>Từ khác nhau</span>
                  <div className={styles.statValue}>{stats.uniqueWords}</div>
                </div>
              </div>

              <div className={styles.statBox}>
                <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                  <FontAwesomeIcon icon={faBookOpen} />
                </div>
                <div>
                  <span className={styles.statLabel}>Số meaning</span>
                  <div className={styles.statValue}>{stats.totalMeanings}</div>
                </div>
              </div>
            </div>

            {/* Hiển thị lỗi preview nếu có */}
            {errors.length > 0 && !importResult && (
              <div className={styles.errorBox}>
                <FontAwesomeIcon icon={faCircleExclamation} />
                <div>
                  {errors.slice(0, 5).map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                  {errors.length > 5 && (
                    <div>Và còn {errors.length - 5} lỗi khác.</div>
                  )}
                </div>
              </div>
            )}

            {/* HIỂN THỊ KẾT QUẢ IMPORT */}
            {importResult && renderImportResult()}

            {/* Footer hành động - luôn ở dưới cùng */}
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => navigate(-1)}
                disabled={isImporting}
              >
                Hủy
              </button>
              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleImport}
                disabled={!file || errors.length > 0 || isImporting}
              >
                <FontAwesomeIcon icon={faCloudArrowUp} />
                {isImporting ? "Đang import..." : "Import từ vựng"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportVocabulary;
