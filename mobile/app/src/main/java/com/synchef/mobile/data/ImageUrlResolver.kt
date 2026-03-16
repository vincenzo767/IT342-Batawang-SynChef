package com.synchef.mobile.data

object ImageUrlResolver {

    fun resolve(rawUrl: String?): String? {
        if (rawUrl.isNullOrBlank()) return null
        if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
            // Replace localhost for physical devices/emulators that cannot reach host loopback.
            return rawUrl
                .replace("http://localhost:8080", NetworkModule.BASE_URL.removeSuffix("/api/"))
                .replace("http://127.0.0.1:8080", NetworkModule.BASE_URL.removeSuffix("/api/"))
        }

        val hostBase = NetworkModule.BASE_URL.removeSuffix("/api/")
        return if (rawUrl.startsWith("/")) "$hostBase$rawUrl" else "$hostBase/$rawUrl"
    }
}
