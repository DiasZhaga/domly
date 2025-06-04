import React from "react";

const TermsOfUseModal = ({ onClose }) => (
  <div className="modal-overlay">
    <div className="modal-content modal-fullscreen-custom">
      <button className="close-btn" onClick={onClose}>&times;</button>
      <h2 className="modal-title">Terms of Use & Platform Fees</h2>

      <div className="modal-body">
        <p>
          By registering on Domly.kz, you agree to abide by these Terms of Use, including the platform’s service fee of 0.30% on each transaction side (Buyer and Seller). This fee is collected at closing and remitted to Domly.kz to maintain platform operations and legal compliance.
        </p>
        <p>
          Submission of forged, counterfeit, or otherwise fraudulent documents in any property transaction is strictly prohibited and punishable under the laws of the Republic of Kazakhstan. Users are responsible for the authenticity of all documentation provided during the sale process.
        </p>
        <p>
          Upon entering into a purchase agreement, the Buyer shall have a period of three (3) calendar days to verify and confirm all necessary documents, including but not limited to title certificates, technical passports, and clearance letters from public authorities. Failure to complete verification within this timeframe may result in transaction cancellation.
        </p>
        <p>
          Final confirmation of the transaction on Domly.kz must occur only after the official State Registration of Rights to Immovable Property has been duly completed with the Registry of Property Rights. Premature confirmation on the platform, prior to state registration, may result in irrecoverable financial loss and is undertaken at the Buyer’s own risk.
        </p>
        <p>
          All statutory fees for notarization, state registration, and related administrative services remain the separate obligation of the Buyer and Seller, in addition to the Domly.kz platform service fee. These customary costs are governed by applicable government tariffs.
        </p>
        <p>
          Any dispute arising from these Terms of Use shall be resolved in accordance with the Housing Relations Law of the Republic of Kazakhstan and related regulations. Domly.kz reserves the right to suspend or terminate user accounts for breaches of these terms without prior notice.
        </p>
        <p>
          Continued use of Domly.kz after publication of any amendments to these Terms shall constitute acceptance of those amendments by the User.
        </p>
      </div>

      <div className="modal-footer">
        <button className="btn btn-success sign-btn" onClick={onClose}>
          Acquainted
        </button>
      </div>
    </div>
  </div>
);

export default TermsOfUseModal;
