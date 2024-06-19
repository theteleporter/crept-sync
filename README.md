# Crept Sync - Cloud Video Management

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

Crept Sync is a robust video management tool designed to streamline the process of uploading and managing videos across cloud storage platforms. It currently offers direct uploads from video URLs to Azure Blob Storage, with plans to integrate more features and cloud providers. 

## Features

### Current Features:

*   **Direct Video URL Uploads:** Easily upload videos from any valid URL.
*   **Google Drive Integration:** Effortlessly transfer videos from Google Drive to Azure.
*   **Azure Blob Storage:** Secure and scalable storage for your uploaded videos.
*   **Customizable Filenames:** Rename your videos upon upload for better organization.
*   **Email Notifications:** Receive automatic email updates on successful uploads or any errors encountered.
*   **Folder Structure:** Upload videos to specific folders and automatically create subfolders for organized storage.

### Upcoming Features:

*   **Video Download:** Download videos stored in your Azure Blob Storage.
*   **FFmpeg Integration:** Process videos with features like resizing, transcoding, and format conversion.
*   **Support for More Cloud Providers:** Expand to include platforms like Mega Sync, Dropbox, AWS S3, and more.
*   **Enhanced UI:** Create a more intuitive and user-friendly interface for managing your videos.
*   **Improved Error Handling & Logging:** Provide more detailed error feedback and logging for easier troubleshooting.

## Installation & Setup

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/theteleporter/crept-sync.git
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Variables:**

    *   Create a `.env.local` file at the root of your project.
    *   Add your Azure Storage, Mailgun, and Google Drive credentials:

    ```
    STORAGE_ACCOUNT_NAME=your_azure_storage_account_name
    STORAGE_ACCOUNT_KEY=your_azure_storage_account_key
    STORAGE_CONTAINER_NAME=your_azure_storage_container_name
    MAILGUN_SMTP_LOGIN=your_mailgun_smtp_login
    MAILGUN_SMTP_PASSWORD=your_mailgun_smtp_password
    COMPANY_EMAIL=your_company_email
    ADMIN_EMAIL=your_admin_email
    NEXT_PUBLIC_APP_URL=http://localhost:3000 # Replace with your actual URL

    GOOGLE_DRIVE_CLIENT_ID=your_google_drive_client_id
    GOOGLE_DRIVE_CLIENT_SECRET=your_google_drive_client_secret
    GOOGLE_DRIVE_REDIRECT_URI=your_google_drive_redirect_uri
    GOOGLE_DRIVE_REFRESH_TOKEN=your_google_drive_refresh_token
    ```

4.  **Start the Development Server:**

    ```bash
    npm run dev
    ```

## Usage

1.  **Access Upload Form:** Navigate to the video upload page in your application.
2.  **Enter Video URLs:** Paste direct video URLs or Google Drive links into the input fields.
3.  **(Optional) Rename Videos:** Specify new filenames if desired.
4.  **(Optional) Select Folder:** Choose the destination folder (or create a new one) for the videos.
5.  **Click Upload:** Click the "Upload Videos" button.
6.  **Receive Notification:** You'll receive an email confirming successful uploads or reporting any errors.

**Important Notes:**

*   **Google Drive Authorization:** For Google Drive uploads, you'll need to authorize the application to access your Drive.
*   **Secure Credentials:** Keep your Azure and Google Drive credentials confidential and stored securely.

## Contributing

We welcome contributions! Feel free to submit issues, feature requests, or pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
