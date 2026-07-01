CREATE TABLE `User` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_lengkap` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `no_whatsapp` VARCHAR(20) NOT NULL,
  `password_hash` VARCHAR(255),
  `no_anggota` VARCHAR(100),
  `cabang` VARCHAR(100),
  `profesi` VARCHAR(100),
  `spesialisasi` VARCHAR(255),
  `tempat_kerja` VARCHAR(255),
  `instagram` VARCHAR(100),
  `bukti_profesi` VARCHAR(255),
  `peran` VARCHAR(50) NOT NULL DEFAULT 'USER',
  `email_verified_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `Branch` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `Tournament` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `event_date` DATETIME NOT NULL,
  `reg_start` DATETIME NOT NULL,
  `reg_end` DATETIME NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  `branch_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`branch_id`) REFERENCES `Branch`(`id`)
);

CREATE TABLE `Category` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `quota` INT NOT NULL,
  `price` FLOAT NOT NULL,
  `tournament_id` INT NOT NULL,
  FOREIGN KEY (`tournament_id`) REFERENCES `Tournament`(`id`)
);

CREATE TABLE `Registration` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `no_registrasi` VARCHAR(255) NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `partner_id` INT,
  `category_id` INT NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  `no_anggota_pair` VARCHAR(100),
  `cabang_perwakilan` VARCHAR(100),
  `ukuran_jersey_p1` VARCHAR(50) NOT NULL,
  `ukuran_jersey_p2` VARCHAR(50),
  `qr_code` VARCHAR(255) UNIQUE,
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `User`(`id`),
  FOREIGN KEY (`partner_id`) REFERENCES `User`(`id`),
  FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`)
);

CREATE TABLE `PaymentProof` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `registration_id` INT NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `file_name_original` VARCHAR(255) NOT NULL,
  `file_size_bytes` INT NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `upload_version` INT NOT NULL DEFAULT 1,
  `is_current` BOOLEAN NOT NULL DEFAULT 1,
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`registration_id`) REFERENCES `Registration`(`id`)
);

CREATE TABLE `ReviewLog` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `registration_id` INT NOT NULL,
  `reviewed_by` INT NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `catatan` TEXT,
  `reviewed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`registration_id`) REFERENCES `Registration`(`id`),
  FOREIGN KEY (`reviewed_by`) REFERENCES `User`(`id`)
);

CREATE TABLE `Notification` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `registration_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `channel` VARCHAR(50) NOT NULL,
  `tipe` VARCHAR(50) NOT NULL,
  `judul` VARCHAR(255) NOT NULL,
  `pesan` TEXT NOT NULL,
  `status_kirim` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  `is_read` BOOLEAN NOT NULL DEFAULT 1,
  `sent_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`registration_id`) REFERENCES `Registration`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `User`(`id`)
);

CREATE TABLE `CheckIn` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `registration_id` INT NOT NULL UNIQUE,
  `checked_in_by` INT NOT NULL,
  `location` VARCHAR(255),
  `p1_checked_in_at` DATETIME NULL,
  `p2_checked_in_at` DATETIME NULL,
  `p1_jersey_taken_by` ENUM('P1', 'P2') NULL,
  `p2_jersey_taken_by` ENUM('P1', 'P2') NULL,
  `checked_in_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`registration_id`) REFERENCES `Registration`(`id`)
);

-- ============================================
-- DUMMY DATA FOR TESTING
-- ============================================

-- Insert Users (Password: password123)
INSERT INTO `User` (`nama_lengkap`, `email`, `no_whatsapp`, `password_hash`, `peran`) VALUES 
('Super Admin', 'superadmin@example.com', '081234567890', '$2b$10$3T97ICeOQaEXeNWfdL8VxeeNvRzVb7edaz8uP4HBDHB2Xrhvucy1O', 'SUPER_ADMIN'),
('Admin Cabang', 'admin@example.com', '081234567891', '$2b$10$3T97ICeOQaEXeNWfdL8VxeeNvRzVb7edaz8uP4HBDHB2Xrhvucy1O', 'ADMIN'),
('Peserta Pertama', 'peserta1@example.com', '081234567892', '$2b$10$3T97ICeOQaEXeNWfdL8VxeeNvRzVb7edaz8uP4HBDHB2Xrhvucy1O', 'USER'),
('Peserta Kedua', 'peserta2@example.com', '081234567893', '$2b$10$3T97ICeOQaEXeNWfdL8VxeeNvRzVb7edaz8uP4HBDHB2Xrhvucy1O', 'USER');

-- Insert Branch
INSERT INTO `Branch` (`name`, `location`) VALUES 
('Wimbledoc Arena - Jakarta', 'Jl. Sudirman, Jakarta Selatan'),
('Wimbledoc Bali', 'Canggu, Bali');

-- Insert Tournament (1 ACTIVE, 1 DRAFT, 1 COMPLETED)
INSERT INTO `Tournament` (`name`, `description`, `event_date`, `reg_start`, `reg_end`, `status`, `branch_id`) VALUES 
('Wimbledoc Open 2026', 'Turnamen tahunan terbesar di Jakarta.', '2026-08-15 08:00:00', '2026-07-01 00:00:00', '2026-08-10 23:59:59', 'ACTIVE', 1),
('Bali Sunset Padel Cup', 'Turnamen seru sambil menikmati sunset.', '2026-12-10 15:00:00', '2026-10-01 00:00:00', '2026-11-30 23:59:59', 'DRAFT', 2),
('Jakarta Spring Tournament', 'Selesai.', '2025-04-20 08:00:00', '2025-03-01 00:00:00', '2025-04-10 23:59:59', 'COMPLETED', 1);

-- Insert Categories for Wimbledoc Open 2026
INSERT INTO `Category` (`name`, `quota`, `price`, `tournament_id`) VALUES 
('Men''s Doubles', 16, 500000, 1),
('Women''s Doubles', 16, 500000, 1),
('Mixed Doubles', 16, 500000, 1);

-- Insert Dummy Registration
INSERT INTO `Registration` (`no_registrasi`, `user_id`, `partner_id`, `category_id`, `status`, `ukuran_jersey_p1`, `ukuran_jersey_p2`, `qr_code`) VALUES 
('REG-WD-10001', 3, 4, 1, 'APPROVED', 'L', 'M', 'QR-WD-10001'),
('REG-WD-10002', 4, 3, 3, 'PENDING', 'XL', 'S', NULL);
