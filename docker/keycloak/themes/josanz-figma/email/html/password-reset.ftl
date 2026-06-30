<#import "template.ftl" as layout>
<@layout.emailLayout>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fffefe;padding:32px 16px;font-family:Raleway,'DM Sans',Arial,sans-serif;color:#222222;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border:1px solid #e7edf1;border-radius:12px;padding:32px 28px;">
        <tr>
          <td align="center" style="padding-bottom:20px;">
            <img src="${properties.hostnameUrl!''}${url.resourcesPath}/img/login-logo.png" alt="Josanz Audiovisual" width="148" height="68" style="display:block;border:0;outline:none;text-decoration:none;" />
          </td>
        </tr>
        <tr>
          <td align="center" style="font-size:24px;font-weight:600;line-height:1.25;padding-bottom:12px;">
            ${msg("passwordResetTitle")}
          </td>
        </tr>
        <tr>
          <td align="center" style="font-size:14px;line-height:1.5;color:#7c7c7c;padding-bottom:24px;">
            ${msg("passwordResetIntro")}
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <a href="${link}" style="display:inline-block;background:#080808;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;line-height:48px;height:48px;padding:0 28px;border-radius:8px;">
              ${msg("passwordResetCta")}
            </a>
          </td>
        </tr>
        <tr>
          <td align="center" style="font-size:12px;line-height:1.5;color:#7c7c7c;">
            ${msg("passwordResetExpiry", linkExpirationFormatter(linkExpiration))}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</@layout.emailLayout>
