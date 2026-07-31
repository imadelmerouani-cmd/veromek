import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const STORE = {
  name: "VeroMek",
  tagline: "Premium Online Store",
  email: "support@veromek.com",
  phone: "+34 000 000 000",
  website: "www.veromek.com",
  address: "Valencia, Spain",
  currency: "USD",
};

const COLORS = {
  black: [12, 12, 14],
  dark: [24, 24, 28],
  darkSoft: [39, 39, 42],
  gold: [212, 175, 55],
  goldSoft: [245, 225, 150],
  white: [255, 255, 255],
  paper: [250, 249, 246],
  muted: [113, 113, 122],
  border: [228, 228, 231],
  success: [22, 163, 74],
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: STORE.currency,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function safeText(value, fallback = "") {
  const text = String(value ?? "").trim();

  return text || fallback;
}

function safeFileName(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function capitalize(value) {
  const text = safeText(value);

  if (!text) {
    return "";
  }

  return (
    text.charAt(0).toUpperCase() +
    text.slice(1).toLowerCase()
  );
}

function drawGoldLine(
  doc,
  x1,
  y1,
  x2,
  y2,
  width = 0.7
) {
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(width);
  doc.line(x1, y1, x2, y2);
}

function drawSectionTitle(
  doc,
  title,
  x,
  y
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gold);
  doc.text(
    safeText(title).toUpperCase(),
    x,
    y
  );
}

function drawInfoLine(
  doc,
  label,
  value,
  x,
  y,
  width = 72
) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    safeText(label).toUpperCase(),
    x,
    y
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.dark);

  const lines = doc.splitTextToSize(
    safeText(value, "-"),
    width
  );

  doc.text(lines, x, y + 5, {
    lineHeightFactor: 1.35,
  });
}

function drawSummaryRow(
  doc,
  label,
  value,
  y,
  {
    bold = false,
    gold = false,
    large = false,
  } = {}
) {
  doc.setFont(
    "helvetica",
    bold ? "bold" : "normal"
  );

  doc.setFontSize(large ? 13 : 9);

  doc.setTextColor(
    ...(gold
      ? COLORS.gold
      : COLORS.dark)
  );

  doc.text(label, 133, y);

  doc.text(value, 192, y, {
    align: "right",
  });
}

function addFooter(
  doc,
  invoiceNumber
) {
  const totalPages =
    doc.internal.getNumberOfPages();

  for (
    let pageNumber = 1;
    pageNumber <= totalPages;
    pageNumber += 1
  ) {
    doc.setPage(pageNumber);

    const pageHeight =
      doc.internal.pageSize.getHeight();

    doc.setFillColor(...COLORS.black);
    doc.rect(
      0,
      pageHeight - 18,
      210,
      18,
      "F"
    );

    drawGoldLine(
      doc,
      0,
      pageHeight - 18,
      210,
      pageHeight - 18,
      0.5
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.goldSoft);

    doc.text(
      `${STORE.name} • ${STORE.email} • ${STORE.website}`,
      15,
      pageHeight - 8
    );

    doc.text(
      `${invoiceNumber} • Page ${pageNumber}/${totalPages}`,
      195,
      pageHeight - 8,
      {
        align: "right",
      }
    );
  }
}

export function generateOrderInvoice(order) {
  if (!order?.id) {
    throw new Error(
      "Invalid order. Invoice cannot be generated."
    );
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const items = Array.isArray(
    order.order_items
  )
    ? order.order_items
    : [];

  const customerName =
    [
      order.first_name,
      order.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() || "Customer";

  const invoiceNumber = `INV-${String(
    order.id
  ).padStart(6, "0")}`;

  const status = capitalize(
    order.status || "pending"
  );

  // =====================================================
  // Dark luxury header
  // =====================================================

  doc.setFillColor(...COLORS.black);
  doc.rect(0, 0, 210, 56, "F");

  drawGoldLine(
    doc,
    15,
    13,
    49,
    13,
    1.2
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(27);
  doc.setTextColor(...COLORS.white);
  doc.text(STORE.name, 15, 27);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.goldSoft);
  doc.text(
    STORE.tagline.toUpperCase(),
    15,
    35
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.gold);
  doc.text("INVOICE", 195, 23, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.white);

  doc.text(
    invoiceNumber,
    195,
    33,
    {
      align: "right",
    }
  );

  doc.text(
    formatDate(order.created_at),
    195,
    41,
    {
      align: "right",
    }
  );

  // =====================================================
  // Invoice metadata strip
  // =====================================================

  doc.setFillColor(...COLORS.dark);
  doc.rect(15, 64, 180, 18, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.goldSoft);

  doc.text("ORDER", 23, 71);
  doc.text("STATUS", 78, 71);
  doc.text("PAYMENT", 129, 71);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.white);

  doc.text(`#${order.id}`, 23, 77);
  doc.text(status.toUpperCase(), 78, 77);

  doc.text(
    capitalize(
      order.payment_method ||
        "Not specified"
    ).toUpperCase(),
    129,
    77
  );

  // =====================================================
  // Billing and shipping blocks
  // =====================================================

  drawSectionTitle(
    doc,
    "Billed To",
    15,
    94
  );

  drawGoldLine(
    doc,
    15,
    97,
    94,
    97,
    0.45
  );

  drawInfoLine(
    doc,
    "Customer",
    customerName,
    15,
    105,
    75
  );

  drawInfoLine(
    doc,
    "Email",
    order.email,
    15,
    119,
    75
  );

  drawInfoLine(
    doc,
    "Phone",
    order.phone,
    15,
    133,
    75
  );

  drawSectionTitle(
    doc,
    "Shipping Address",
    111,
    94
  );

  drawGoldLine(
    doc,
    111,
    97,
    195,
    97,
    0.45
  );

  const addressText = [
    safeText(order.address),
    [
      order.city,
      order.country,
    ]
      .filter(Boolean)
      .join(", "),
  ]
    .filter(Boolean)
    .join("\n");

  drawInfoLine(
    doc,
    "Address",
    addressText,
    111,
    105,
    78
  );

  // =====================================================
  // Products table
  // =====================================================

  const tableRows =
    items.length > 0
      ? items.map((item, index) => {
          const quantity = Math.max(
            0,
            Number(
              item.quantity || 0
            )
          );

          const price = Math.max(
            0,
            Number(item.price || 0)
          );

          return [
            String(index + 1),
            safeText(
              item.product_name,
              "Unnamed product"
            ),
            String(quantity),
            formatCurrency(price),
            formatCurrency(
              price * quantity
            ),
          ];
        })
      : [
          [
            "-",
            "No products found",
            "-",
            "-",
            "-",
          ],
        ];

  autoTable(doc, {
    startY: 153,

    head: [
      [
        "#",
        "Product",
        "Qty",
        "Unit Price",
        "Amount",
      ],
    ],

    body: tableRows,

    theme: "grid",

    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: {
        top: 4.2,
        right: 3,
        bottom: 4.2,
        left: 3,
      },

      textColor: COLORS.dark,
      lineColor: COLORS.border,
      lineWidth: 0.18,
      valign: "middle",
    },

    headStyles: {
      fillColor: COLORS.black,
      textColor: COLORS.goldSoft,
      fontStyle: "bold",
      lineColor: COLORS.gold,
      lineWidth: 0.25,
    },

    alternateRowStyles: {
      fillColor: COLORS.paper,
    },

    columnStyles: {
      0: {
        cellWidth: 12,
        halign: "center",
      },

      1: {
        cellWidth: 78,
      },

      2: {
        cellWidth: 18,
        halign: "center",
      },

      3: {
        cellWidth: 36,
        halign: "right",
      },

      4: {
        cellWidth: 36,
        halign: "right",
      },
    },

    margin: {
      left: 15,
      right: 15,
      bottom: 30,
    },

    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        doc.setFillColor(...COLORS.black);
        doc.rect(0, 0, 210, 18, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.goldSoft);

        doc.text(
          `${STORE.name} • ${invoiceNumber}`,
          15,
          11
        );
      }
    },
  });

  // =====================================================
  // Payment summary
  // =====================================================

  const tableEndY =
    doc.lastAutoTable?.finalY || 175;

  let summaryY = tableEndY + 11;

  const hasDiscount =
    order.coupon_code &&
    Number(order.discount || 0) > 0;

  const summaryHeight =
    hasDiscount ? 58 : 49;

  if (summaryY > 225) {
    doc.addPage();
    summaryY = 30;
  }

  doc.setFillColor(...COLORS.black);
  doc.roundedRect(
    118,
    summaryY,
    77,
    summaryHeight,
    2.5,
    2.5,
    "F"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.gold);
  doc.text(
    "PAYMENT SUMMARY",
    126,
    summaryY + 10
  );

  let rowY = summaryY + 21;

  drawSummaryRow(
    doc,
    "Subtotal",
    formatCurrency(order.subtotal),
    rowY,
    {
      gold: false,
    }
  );

  rowY += 8;

  if (hasDiscount) {
    drawSummaryRow(
      doc,
      `Coupon (${safeText(
        order.coupon_code
      )})`,
      `-${formatCurrency(
        order.discount
      )}`,
      rowY,
      {
        gold: true,
      }
    );

    rowY += 8;
  }

  drawSummaryRow(
    doc,
    "Shipping",
    Number(order.shipping || 0) === 0
      ? "FREE"
      : formatCurrency(
          order.shipping
        ),
    rowY
  );

  rowY += 9;

  drawGoldLine(
    doc,
    126,
    rowY - 3,
    187,
    rowY - 3,
    0.45
  );

  drawSummaryRow(
    doc,
    "TOTAL",
    formatCurrency(order.total),
    rowY + 2,
    {
      bold: true,
      gold: true,
      large: true,
    }
  );

  // =====================================================
  // Luxury note
  // =====================================================

  const noteY =
    summaryY + summaryHeight + 12;

  if (noteY < 266) {
    drawGoldLine(
      doc,
      15,
      noteY - 5,
      66,
      noteY - 5,
      0.6
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.dark);

    doc.text(
      "THANK YOU FOR YOUR ORDER",
      15,
      noteY
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);

    doc.text(
      "We appreciate your trust in VeroMek. Keep this invoice for your records.",
      15,
      noteY + 6
    );
  }

  // =====================================================
  // Footer and download
  // =====================================================

  addFooter(
    doc,
    invoiceNumber
  );

  const customerFilePart =
    safeFileName(customerName);

  const fileName = [
    STORE.name,
    "Premium-Invoice",
    order.id,
    customerFilePart,
  ]
    .filter(Boolean)
    .join("-");

  doc.save(`${fileName}.pdf`);

  return true;
}