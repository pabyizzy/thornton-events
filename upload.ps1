# PowerShell FTP Upload Script for Hostinger
param(
    [string]$FtpHost = "ftp.lightcoral-dragonfly-511011.hostingersite.com",
    [string]$Username = "u623471226.thorntonevents",
    [string]$Password = "WrH&~hcy!>!fQt5@",
    [string]$RemotePath = "/home/u623471226/domains/lightcoral-dragonfly-511011.hostingersite.com/public_html/",
    [string]$LocalPath = "./out"
)

Write-Host "🚀 Uploading to Hostinger..." -ForegroundColor Green

# Function to upload files via FTP
function Upload-Files {
    param($FtpHost, $Username, $Password, $RemotePath, $LocalPath)
    
    try {
        # Create FTP request
        $FtpRequest = [System.Net.FtpWebRequest]::Create("ftp://$FtpHost$RemotePath")
        $FtpRequest.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)
        $FtpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
        
        # Test connection
        Write-Host "📡 Testing FTP connection..." -ForegroundColor Yellow
        $Response = $FtpRequest.GetResponse()
        $Response.Close()
        Write-Host "✅ FTP connection successful!" -ForegroundColor Green
        
        # Get all files in local directory
        $Files = Get-ChildItem -Path $LocalPath -Recurse -File
        
        foreach ($File in $Files) {
            $RelativePath = $File.FullName.Substring((Resolve-Path $LocalPath).Path.Length + 1)
            $RemoteFilePath = $RemotePath + $RelativePath.Replace('\', '/')
            
            Write-Host "📤 Uploading: $RelativePath" -ForegroundColor Cyan
            
            # Create FTP request for file upload
            $FtpRequest = [System.Net.FtpWebRequest]::Create("ftp://$FtpHost$RemoteFilePath")
            $FtpRequest.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)
            $FtpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
            $FtpRequest.UseBinary = $true
            
            # Read file and upload
            $FileContent = [System.IO.File]::ReadAllBytes($File.FullName)
            $FtpRequest.ContentLength = $FileContent.Length
            
            $RequestStream = $FtpRequest.GetRequestStream()
            $RequestStream.Write($FileContent, 0, $FileContent.Length)
            $RequestStream.Close()
            
            $Response = $FtpRequest.GetResponse()
            $Response.Close()
            
            Write-Host "✅ Uploaded: $RelativePath" -ForegroundColor Green
        }
        
        Write-Host "🎉 All files uploaded successfully!" -ForegroundColor Green
        Write-Host "🌐 Your site is live at: https://lightcoral-dragonfly-511011.hostingersite.com" -ForegroundColor Yellow
        
    } catch {
        Write-Host "❌ Upload failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "📋 Manual upload instructions:" -ForegroundColor Yellow
        Write-Host "1. Upload all contents from the out folder to Hostinger public_html" -ForegroundColor White
        Write-Host "2. Make sure the .htaccess file is included" -ForegroundColor White
    }
}

# Run the upload
Upload-Files -FtpHost $FtpHost -Username $Username -Password $Password -RemotePath $RemotePath -LocalPath $LocalPath
