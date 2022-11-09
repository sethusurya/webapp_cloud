module.exports = {
    apps: [
        {
            name: 'webapp',
            script: './server.js',
            env: {
                "NODE_ENV": "production",
            },
            error_file: '/home/ubuntu/logs/webapp-error.log',
            combine_logs: true,
            out_file: '/home/ubuntu/logs/webapp-output.log',
            log_date_format: 'YYYY-MM-DD HH:mm Z'
        },
    ],
}