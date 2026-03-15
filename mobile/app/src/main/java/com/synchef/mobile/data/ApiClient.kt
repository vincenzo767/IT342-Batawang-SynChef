package com.synchef.mobile.data

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Authenticated API client. Call [init] once (e.g. in DashboardActivity or Application) before
 * using [recipeApi] or [userApi]. The token is read from [tokenProvider] on every request so it
 * always reflects the current session.
 */
object ApiClient {

    private val BASE_URL get() = NetworkModule.BASE_URL

    /** Set this before making any authenticated API call. */
    var tokenProvider: (() -> String?)? = null

    private val okHttpClient: OkHttpClient by lazy {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        OkHttpClient.Builder()
            .addInterceptor { chain ->
                val token = tokenProvider?.invoke()
                val request = if (!token.isNullOrBlank()) {
                    chain.request().newBuilder()
                        .addHeader("Authorization", "Bearer $token")
                        .build()
                } else {
                    chain.request()
                }
                chain.proceed(request)
            }
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    private val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    val recipeApi: RecipeApi by lazy { retrofit.create(RecipeApi::class.java) }
    val userApi: UserApi by lazy { retrofit.create(UserApi::class.java) }
}
