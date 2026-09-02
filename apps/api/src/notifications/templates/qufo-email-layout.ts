export type QufoEmailLayoutOptions = {
  title: string;

  preheader?: string | null;

  businessName?: string | null;

  businessLogoUrl?: string | null;

  content: string;

  infoCard?: string | null;

  actionLabel?: string | null;

  actionUrl?: string | null;

  footerNote?: string | null;
};

const QUFO_LOGO_URL = 'https://qufo.im/images/qufo_logo_variant2.png';

const QUFO_URL = 'https://qufo.im';

export function buildQufoEmail({
  title,
  preheader,
  businessName,
  businessLogoUrl,
  content,
  infoCard,
  actionLabel,
  actionUrl,
  footerNote,
}: QufoEmailLayoutOptions): string {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <meta
          name="color-scheme"
          content="light"
        />

        <meta
          name="supported-color-schemes"
          content="light"
        />

        <title>${title}</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f4f7fb;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
          color: #172033;
        "
      >
        ${
          preheader
            ? `
              <div
                style="
                  display: none;
                  max-height: 0;
                  overflow: hidden;
                  opacity: 0;
                  color: transparent;
                "
              >
                ${preheader}
              </div>
            `
            : ''
        }

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width: 100%;
            background-color: #f4f7fb;
          "
        >
          <tr>
            <td
              align="center"
              style="
                padding: 40px 16px;
              "
            >
              <table
                role="presentation"
                width="620"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width: 100%;
                  max-width: 620px;
                  background-color: #ffffff;
                  border: 1px solid #e7ecf3;
                  border-radius: 18px;
                  overflow: hidden;
                "
              >
                <!-- QUFO HEADER -->
                <tr>
                  <td
                    style="
                      padding: 22px 28px;
                      background-color: #07111f;
                    "
                  >
                    <table
                      role="presentation"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                    >
                      <tr>
                        ${
                          businessLogoUrl
                            ? `
                              <td
                                valign="middle"
                                style="
                                  vertical-align: middle;
                                "
                              >
                                <img
                                  src="${businessLogoUrl}"
                                  alt="${businessName ?? 'Business'}"
                                  width="48"
                                  height="48"
                                  style="
                                    display: block;
                                    width: 48px;
                                    height: 48px;
                                    border: 0;
                                    border-radius: 10px;
                                    outline: none;
                                    object-fit: contain;
                                    background-color: #ffffff;
                                  "
                                />
                              </td>
                            `
                            : `
                              <td
                                valign="middle"
                                style="
                                  vertical-align: middle;
                                "
                              >
                                <img
                                  src="${QUFO_LOGO_URL}"
                                  alt="QUFO"
                                  width="42"
                                  height="42"
                                  style="
                                    display: block;
                                    width: 42px;
                                    height: 42px;
                                    border: 0;
                                    outline: none;
                                    object-fit: contain;
                                  "
                                />
                              </td>
                            `
                        }

                        <td
                          valign="middle"
                          style="
                            padding-left: 12px;
                            vertical-align: middle;
                          "
                        >
                          <div
                            style="
                              font-size: 18px;
                              line-height: 24px;
                              font-weight: 700;
                              color: #ffffff;
                            "
                          >
                            ${businessName ? businessName : 'QUFO'}
                          </div>

                          <div
                            style="
                              margin-top: 3px;
                              font-size: 12px;
                              line-height: 18px;
                              color: #94a3b8;
                            "
                          >
                            ${businessName ? 'Quotation' : 'Quick Flow for your business'}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CONTENT -->
                <tr>
                  <td
                    style="
                      padding: 32px 30px;
                    "
                  >
                    <h1
                      style="
                        margin: 0 0 20px;
                        font-size: 24px;
                        line-height: 32px;
                        font-weight: 700;
                        color: #172033;
                      "
                    >
                      ${title}
                    </h1>

                    <div
                      style="
                        font-size: 15px;
                        line-height: 24px;
                        color: #344054;
                      "
                    >
                      ${content}
                    </div>

                    ${
                      infoCard
                        ? `
                          <div
                            style="
                              margin-top: 24px;
                              padding: 18px;
                              background-color: #f6f8fb;
                              border: 1px solid #edf1f5;
                              border-radius: 12px;
                            "
                          >
                            ${infoCard}
                          </div>
                        `
                        : ''
                    }

                    ${
                      actionLabel && actionUrl
                        ? `
                          <div
                            style="
                              margin-top: 28px;
                            "
                          >
                            <a
                              href="${actionUrl}"
                              target="_blank"
                              style="
                                display: inline-block;
                                padding: 13px 20px;
                                background-color: #07111f;
                                border-radius: 10px;
                                color: #ffffff;
                                font-size: 14px;
                                line-height: 20px;
                                font-weight: 700;
                                text-decoration: none;
                              "
                            >
                              ${actionLabel}
                            </a>
                          </div>
                        `
                        : ''
                    }

                    ${
                      footerNote
                        ? `
                          <div
                            style="
                              margin-top: 26px;
                              font-size: 13px;
                              line-height: 20px;
                              color: #667085;
                            "
                          >
                            ${footerNote}
                          </div>
                        `
                        : ''
                    }
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td
                    style="
                      padding: 20px 30px;
                      border-top: 1px solid #edf1f5;
                      background-color: #fbfcfe;
                      font-size: 12px;
                      line-height: 18px;
                      color: #98a2b3;
                    "
                  >
                    Sent securely through

                    <a
                      href="${QUFO_URL}"
                      target="_blank"
                      style="
                        color: #667085;
                        font-weight: 700;
                        text-decoration: none;
                      "
                    >
                      QUFO
                    </a>

                    · Quick Flow for your business
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
