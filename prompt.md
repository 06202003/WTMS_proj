# ROLE

Anda adalah seorang **Lead Business Analyst**, **Senior Product Manager**, **System Analyst**, dan **Software Architect** dengan pengalaman lebih dari 15 tahun membangun sistem enterprise.

Tugas Anda adalah menyusun ulang dokumentasi yang saya lampirkan menjadi **Product Requirement Document (PRD)** yang profesional, lengkap, mudah dipahami, dan siap digunakan sebagai acuan pengembangan sistem.

Anda **bukan sekadar merapikan dokumen**, tetapi harus melakukan analisis, menyempurnakan requirement, melengkapi bagian yang kurang, menghilangkan inkonsistensi, serta menyusun ulang struktur dokumentasi agar memenuhi standar industri perangkat lunak.

Dokumen akhir harus terlihat seperti hasil Business Analyst profesional, bukan hasil AI ataupun tugas kuliah.

---

# TUJUAN

Membuat dokumentasi resmi untuk sistem:

# **Wimbledoc Tournament Management System (WTMS)**

Versi:

**v1.0**

Dokumen ini akan menjadi **Single Source of Truth** selama proses pengembangan aplikasi.

Target pembaca:

* Product Owner
* Business Owner
* Business Analyst
* UI/UX Designer
* Frontend Developer
* Backend Developer
* QA Engineer
* DevOps Engineer

---

# KONTEKS SISTEM

WTMS bukan sekadar sistem pendaftaran turnamen.

WTMS merupakan platform manajemen turnamen yang dapat digunakan berulang kali oleh seluruh cabang Wimbledoc.

Sistem harus mampu mengelola seluruh siklus turnamen mulai dari pembuatan event, registrasi peserta, pembayaran, waiting list, approval, QR Check In hingga reporting.

---

# CARA BERPIKIR

Sebelum mulai menulis dokumen:

1. Analisis seluruh dokumen yang saya lampirkan.
2. Cari requirement yang belum dijelaskan.
3. Lengkapi requirement yang masih kurang.
4. Buat asumsi bisnis yang masuk akal apabila ada informasi yang belum tersedia.
5. Jelaskan asumsi tersebut pada bagian **Asumsi Sistem**.
6. Susun ulang seluruh dokumentasi menjadi jauh lebih profesional.
7. Jangan sekadar menyalin isi dokumen lama.

Berpikirlah seperti Business Analyst yang sedang membuat requirement resmi sebelum proyek dimulai.

---

# KONSEP SISTEM

## 1. Multi Branch

Satu organisasi Wimbledoc memiliki banyak cabang.

Contoh:

Wimbledoc

↓

Cabang Bandung

Cabang Jakarta

Cabang Surabaya

Setiap cabang dapat mengelola turnamennya masing-masing.

---

## 2. Multi Tournament

Satu cabang dapat memiliki banyak turnamen.

Bahkan beberapa turnamen dapat berjalan bersamaan.

Contoh:

Cabang Bandung

↓

Tournament A

Tournament B

Tournament C

---

## 3. Multi Category

Setiap turnamen dapat memiliki banyak kategori.

Contoh:

* Men's Double
* Women's Double
* Mixed Double

Kategori harus dapat ditambah atau diubah oleh Admin.

Setiap kategori memiliki:

* Nama
* Kuota
* Harga
* Status
* Deskripsi

---

# REQUIREMENT BISNIS

## Event

Sistem digunakan berulang kali.

Bukan hanya untuk satu turnamen.

Satu cabang dapat membuat banyak turnamen.

Beberapa turnamen dapat berjalan bersamaan.

Setiap turnamen memiliki:

* Nama Turnamen
* Deskripsi
* Lokasi
* Tanggal Turnamen
* Tanggal Registrasi Dibuka
* Tanggal Registrasi Ditutup
* Status
* Banner
* Informasi Tambahan

---

## Kuota

Kuota dapat diatur oleh Admin.

Jika kuota penuh:

Peserta masuk Waiting List.

Waiting List tidak diwajibkan membayar.

Apabila ada slot kosong:

Sistem mengirim email.

Peserta mendapat kesempatan melakukan pembayaran.

Apabila tidak melakukan pembayaran dalam batas waktu tertentu maka slot diberikan ke Waiting List berikutnya.

Registrasi otomatis ditutup ketika melewati tanggal penutupan.

---

## Registrasi

Registrasi dilakukan per pasangan.

Satu akun mewakili satu pasangan.

Dalam satu turnamen peserta hanya boleh mengikuti satu kategori.

Harga dihitung berdasarkan pasangan.

---

## Partner

Partner tidak wajib memiliki akun.

Karena hanya satu orang yang melakukan registrasi.

Namun sistem tetap menyimpan data pasangan.

Apabila terjadi pergantian partner:

Harus melalui persetujuan Admin.

Riwayat pergantian partner harus dicatat.

---

## Pembayaran

Metode pembayaran:

Transfer Bank.

Nominal pembayaran dihitung berdasarkan harga kategori.

Peserta mengunggah bukti pembayaran.

Admin melakukan verifikasi manual.

Jika bukti pembayaran ditolak:

Admin memberikan alasan penolakan.

Peserta dapat mengunggah ulang bukti pembayaran.

Upload ulang hanya diperbolehkan apabila Admin meminta revisi.

---

## Refund

Fitur Refund tetap dibuat walaupun kebijakan bisnis masih dapat berubah.

Default:

Refund dinonaktifkan.

Namun desain sistem harus mendukung:

* Refund Request
* Refund Approved
* Refund Rejected
* Refund Completed

Policy refund dapat dikonfigurasi di masa depan.

---

## Jersey

Ukuran jersey dapat diubah sampai H-14.

Nilai H-14 tidak hardcoded.

Harus menjadi konfigurasi sistem.

Setelah melewati batas waktu tersebut ukuran jersey terkunci.

---

## Authentication

Sistem mendukung:

* Login menggunakan Email
* Login menggunakan Google OAuth

Registrasi menggunakan Email tetap tersedia.

Email wajib unik.

Email wajib diverifikasi.

Sistem harus menyediakan:

* Register
* Login
* Logout
* Forgot Password
* Reset Password
* Change Password
* Verify Email

Mayoritas pengguna diperkirakan menggunakan Google Login.

---

## User Profile

Peserta dapat mengubah:

* Nama
* Nomor HP
* Foto Profil
* Password

Email tidak dapat diubah setelah diverifikasi.

---

## Role

Hanya terdapat dua role.

### Super Admin

Memiliki akses:

* Branch Management
* Global Configuration
* Master Data
* User Management

### Admin

Memiliki akses:

* Tournament
* Category
* Registrasi
* Approval
* Waiting List
* Dashboard
* Reporting
* Check In

Semua Admin dapat melakukan Approve maupun Reject.

---

## Dashboard

Dashboard minimal menampilkan:

* Total Tournament
* Total Registrasi
* Pending Review
* Waiting List
* Approved
* Rejected
* Checked In
* Revenue
* Upcoming Tournament
* Capacity

---

## Notification

Media notifikasi:

* Email
* Notifikasi dalam aplikasi

WhatsApp tidak digunakan.

Notifikasi dikirim ketika:

* Registrasi berhasil
* Email berhasil diverifikasi
* Menunggu pembayaran
* Bukti pembayaran ditolak
* Bukti pembayaran diterima
* Masuk Waiting List
* Waiting List mendapatkan slot
* Registrasi disetujui
* QR Code tersedia

---

## QR Check In

Peserta yang Approved memperoleh QR Code.

Saat hari H panitia melakukan scan QR.

Sistem mencatat:

* Jam Check In
* Lokasi
* Petugas

QR tidak boleh digunakan dua kali.

---

## Reporting

Semua data dapat diekspor ke:

* Excel
* PDF

Laporan minimal:

* Peserta
* Pembayaran
* Waiting List
* Jersey
* Attendance
* Tournament
* Audit Log

---

## Audit Log

Seluruh aktivitas penting wajib dicatat.

Contoh:

* Login
* Logout
* Registrasi
* Edit Profil
* Pergantian Partner
* Upload Bukti Pembayaran
* Approve
* Reject
* Check In

---

## Security

Peserta tidak boleh mengakses file peserta lain.

File bukti pembayaran harus menggunakan akses yang aman (protected/signed URL).

Semua endpoint harus menggunakan Role Based Access Control.

---

# BUSINESS RULE

Kembangkan seluruh Business Rule secara rinci.

Berikan contoh.

Berikan edge case.

Jelaskan apabila terdapat pengecualian.

---

# FUNCTIONAL REQUIREMENT

Setiap fitur wajib memiliki:

* ID Requirement (FR-001, FR-002, dst.)
* Nama Fitur
* Tujuan
* Aktor
* Pre-condition
* Trigger
* Main Flow
* Alternative Flow
* Exception Flow
* Post-condition
* Acceptance Criteria

---

# NON FUNCTIONAL REQUIREMENT

Jelaskan minimal mengenai:

* Performance
* Security
* Scalability
* Availability
* Maintainability
* Logging
* Backup
* Compatibility
* Responsive Design
* Accessibility

---

# FLOW DIAGRAM

Gunakan Mermaid.

Minimal buat:

* Business Flow
* Registration Flow
* Payment Flow
* Waiting List Flow
* Tournament Lifecycle
* QR Check In Flow
* Admin Approval Flow

---

# STATE DIAGRAM

Lengkapi status registrasi.

Contoh:

Draft

↓

Email Verified

↓

Waiting Payment

↓

Pending Review

↓

Revision Requested

↓

Approved

↓

Checked In

↓

Completed

Tambahkan status:

* Waiting List
* Rejected
* Cancelled
* Refund Requested
* Refund Approved
* Refund Completed

---

# DATABASE

Buat Conceptual ERD.

Tanpa SQL.

Entity utama:

* Branch
* Tournament
* Category
* User
* Registration
* Partner
* Payment
* Notification
* Audit Log
* QR Code
* Check In

Jelaskan relasi antar entity.

---

# API

Tidak perlu endpoint detail.

Cukup kelompok API:

* Authentication
* Tournament
* Category
* Registration
* Payment
* Dashboard
* Reporting
* Notification

---

# FORMAT DOKUMEN

Gunakan gaya profesional.

Bukan gaya akademik.

Gunakan heading yang konsisten.

Gunakan tabel apabila diperlukan.

Gunakan numbering.

Hindari pengulangan.

Gunakan bahasa Indonesia yang formal, jelas, dan mudah dipahami.

---

# STRUKTUR DOKUMEN

1. Cover
2. Document Control
3. Executive Summary
4. Business Background
5. Business Objectives
6. Scope
7. Stakeholder
8. User Roles & Permission
9. Business Rules
10. Functional Requirements
11. Non Functional Requirements
12. Business Process
13. Workflow Diagram
14. Dashboard
15. Reporting
16. Notification
17. QR Check In
18. Database Concept
19. Future Enhancement
20. Appendix

---

# TARGET OUTPUT

* Panjang sekitar 20 halaman.
* Fokus pada kualitas, bukan jumlah halaman.
* Dokumen harus siap digunakan sebagai acuan pengembangan aplikasi.
* Jangan membuat implementasi teknis yang terlalu detail.
* Jika terdapat requirement yang kurang jelas, buat asumsi yang rasional dan dokumentasikan secara eksplisit pada bagian **Asumsi Sistem**.
