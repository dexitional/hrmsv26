-- Payslips from the payroll system (Directorate of Finance), one per staff
-- member per pay month, for the staff portal's payslip feature.
--
-- The payroll export (files/bkp/payslip.json) has, per payslip: a header
-- (who, where, grade, bank, basic/net salary, PAYE, SSNIT, provident and
-- superannuation), an approval record (1:1), and lists of allowances,
-- deductions, reliefs and loan repayments. The header and approval share
-- hrms_payslips; the money lines go in hrms_payslip_lines (one table, a kind
-- column) and loans in hrms_payslip_loans (they carry balances, not one amount).
--
-- How the figures reconcile (checked against the export):
--   basic_salary   = annual_salary / 12
--   gross_salary   = basic_salary + allowances
--   ssf_employee   = 5.5% of basic, ssf_employer = 13% of basic
--   net_salary     = gross - PAYE - SSF (employee) - deductions - loan repayments
--                    (- provident/superannuation employee shares when present;
--                    to within a pesewa of rounding)
-- gross_salary and the totals are stored when imported, so lists and year
-- summaries need no sums over the lines.

CREATE TABLE hrms_payslips (
  id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  payroll_id            VARCHAR(20)  NOT NULL COMMENT 'Payroll payslip id: YYYYMM + 10-digit payroll employee id',
  payroll_employee_id   INT UNSIGNED NOT NULL COMMENT 'hrId: the employee id in the payroll system (not staff.id)',
  staff_no              INT UNSIGNED NOT NULL COMMENT 'staffCode: staff.staff_no in the HRMS',
  pay_year              SMALLINT UNSIGNED NOT NULL,
  pay_month             TINYINT UNSIGNED NOT NULL,

  -- Who and where, as on the payslip that month
  staff_name            VARCHAR(200) NOT NULL,
  category              VARCHAR(60)  NULL COMMENT 'Senior Member / Senior Staff / Junior Staff',
  job_title             VARCHAR(150) NULL,
  unit_name             VARCHAR(255) NULL,
  location              VARCHAR(100) NULL,
  grade                 VARCHAR(10)  NULL,
  notch                 VARCHAR(10)  NULL,
  ssn                   VARCHAR(30)  NULL COMMENT 'SSNIT number',
  days_worked           TINYINT UNSIGNED NULL,
  is_head               TINYINT(1)   NOT NULL DEFAULT 0,
  head_payroll_id       INT UNSIGNED NULL COMMENT 'Payroll employee id of the head who approves',
  work_email            VARCHAR(150) NULL,
  phone                 VARCHAR(30)  NULL,

  -- Where the net pay went
  bank_name             VARCHAR(150) NULL,
  bank_branch           VARCHAR(150) NULL,
  bank_account_no       VARCHAR(40)  NULL,
  currency              VARCHAR(30)  NOT NULL DEFAULT 'Ghana Cedi',

  -- Amounts (GHS)
  annual_salary         DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT 'Annual basic salary for the grade and notch',
  basic_salary          DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_allowances      DECIMAL(12,2) NOT NULL DEFAULT 0,
  gross_salary          DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_reliefs         DECIMAL(12,2) NOT NULL DEFAULT 0,
  irs_tax               DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'PAYE',
  ssf_employee          DECIMAL(12,2) NOT NULL DEFAULT 0,
  ssf_employer          DECIMAL(12,2) NOT NULL DEFAULT 0,
  sup_employee          DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Superannuation',
  sup_employer          DECIMAL(12,2) NOT NULL DEFAULT 0,
  prov_employee         DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Provident fund',
  prov_employer         DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_deductions      DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Other deductions (associations, welfare, ...)',
  total_loan_repayments DECIMAL(12,2) NOT NULL DEFAULT 0,
  net_salary            DECIMAL(12,2) NOT NULL DEFAULT 0,

  -- Approval (payslipMainApproval)
  approval_id           VARCHAR(40)  NULL,
  approved              TINYINT(1)   NOT NULL DEFAULT 0,
  approved_by_payroll_id INT UNSIGNED NULL COMMENT 'approvedByHod: payroll employee id',
  approved_at           DATETIME     NULL,
  approval_comment      VARCHAR(500) NULL,
  has_access            TINYINT(1)   NOT NULL DEFAULT 0 COMMENT 'Released to the staff member',
  has_approved          TINYINT      NULL COMMENT 'Payroll flag, as exported (-1, 0, 1)',

  -- The staff member opening it in the portal
  first_viewed_at       DATETIME     NULL,
  last_viewed_at        DATETIME     NULL,
  view_count            INT UNSIGNED NOT NULL DEFAULT 0,

  payroll_created_at    DATETIME     NULL,
  payroll_created_by    VARCHAR(100) NULL,
  imported_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_payslips_payroll_id (payroll_id),
  UNIQUE KEY uq_payslips_employee_month (payroll_employee_id, pay_year, pay_month),
  KEY idx_payslips_staff_period (staff_no, pay_year, pay_month),
  KEY idx_payslips_period (pay_year, pay_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Allowances (earnings), deductions and reliefs on a payslip.
CREATE TABLE hrms_payslip_lines (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  payslip_id  BIGINT UNSIGNED NOT NULL,
  source_id   VARCHAR(40)  NULL COMMENT 'Line id in the payroll export',
  kind        ENUM('ALLOWANCE', 'DEDUCTION', 'RELIEF') NOT NULL,
  name        VARCHAR(150) NOT NULL COMMENT 'allowanceType / deductionType / reliefType, e.g. Rent, USHEF',
  amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
  taxable     TINYINT(1)   NULL COMMENT 'Allowances only',
  is_arrears  TINYINT(1)   NOT NULL DEFAULT 0 COMMENT 'Back pay: the name ends in "Arrears"',
  frequency   VARCHAR(20)  NULL COMMENT 'Monthly, ...',
  PRIMARY KEY (id),
  UNIQUE KEY uq_payslip_lines_source (source_id),
  KEY idx_payslip_lines_payslip (payslip_id, kind),
  KEY idx_payslip_lines_name (kind, name),
  CONSTRAINT fk_payslip_lines_payslip FOREIGN KEY (payslip_id) REFERENCES hrms_payslips (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Loan repayments taken from a payslip, with the loan's size and what remains.
CREATE TABLE hrms_payslip_loans (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  payslip_id        BIGINT UNSIGNED NOT NULL,
  source_id         VARCHAR(40)  NULL,
  loan_type         VARCHAR(150) NOT NULL COMMENT 'Lender or scheme, e.g. Prudential',
  principal_payment DECIMAL(12,2) NOT NULL DEFAULT 0,
  interest_payment  DECIMAL(12,2) NOT NULL DEFAULT 0,
  loan_balance      DECIMAL(14,2) NULL COMMENT 'Outstanding after this payment',
  loan_amount       DECIMAL(14,2) NULL COMMENT 'Original amount (changes on a top-up)',
  PRIMARY KEY (id),
  UNIQUE KEY uq_payslip_loans_source (source_id),
  KEY idx_payslip_loans_payslip (payslip_id),
  CONSTRAINT fk_payslip_loans_payslip FOREIGN KEY (payslip_id) REFERENCES hrms_payslips (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
