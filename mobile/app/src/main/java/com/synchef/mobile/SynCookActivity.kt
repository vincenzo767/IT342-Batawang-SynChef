package com.synchef.mobile

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.widget.*
import androidx.recyclerview.widget.LinearLayoutManager
import com.synchef.mobile.data.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import java.io.ByteArrayOutputStream

class SynCookActivity : Activity() {

    private lateinit var sessionManager: SessionManager
    private val repository = RecipeRepository()
    private val screenJob = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + screenJob)

    private lateinit var tvStatus: TextView
    private lateinit var etSearch: EditText

    private lateinit var publicAdapter: SynCookRecipeAdapter

    private var publicRecipes: List<SynCookRecipe> = emptyList()
    private var myRecipes: List<SynCookRecipe> = emptyList()

    private var pendingImageField: EditText? = null
    private var pendingImagePreview: ImageView? = null

    companion object {
        private const val IMAGE_PICK_REQUEST = 1401
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_syncook)

        sessionManager = SessionManager(this)
        if (!sessionManager.isLoggedIn()) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        ApiClient.tokenProvider = { sessionManager.getToken() }

        tvStatus = findViewById(R.id.tvSynCookStatus)
        etSearch = findViewById(R.id.etSynCookSearch)

        val rvPublic = findViewById<androidx.recyclerview.widget.RecyclerView>(R.id.rvSynCookRecipes)
        publicAdapter = SynCookRecipeAdapter(
            recipes = emptyList(),
            showOwnerActions = false,
            onView = { recipe -> openRecipeDialog(recipe.id) },
            onEdit = {},
            onDelete = {}
        )
        rvPublic.layoutManager = LinearLayoutManager(this)
        rvPublic.adapter = publicAdapter

        findViewById<Button>(R.id.btnSynCookCreate).setOnClickListener {
            openCreateDialog(null)
        }

        findViewById<Button>(R.id.btnSynCookManage).setOnClickListener {
            openManageDialog()
        }

        etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) = Unit
            override fun afterTextChanged(s: Editable?) {
                applyFilter(s?.toString().orEmpty())
            }
        })

        BottomNavHelper.setup(this, BottomNavHelper.TAB_SYNCOOK)
        loadSynCook()
    }

    override fun onResume() {
        super.onResume()
        loadSynCook()
    }

    private fun loadSynCook() {
        tvStatus.visibility = View.VISIBLE
        tvStatus.text = "Loading SynCook recipes..."

        uiScope.launch {
            repository.getPublicSynCookRecipes().onSuccess { publicList ->
                publicRecipes = publicList
                applyFilter(etSearch.text?.toString().orEmpty())
            }.onFailure { err ->
                publicRecipes = emptyList()
                publicAdapter.updateRecipes(emptyList())
                tvStatus.text = "Could not load recipes: ${err.message}"
            }

            repository.getMySynCookRecipes().onSuccess { mine ->
                myRecipes = mine
            }.onFailure {
                myRecipes = emptyList()
            }
        }
    }

    private fun applyFilter(keyword: String) {
        val normalized = keyword.trim().lowercase()
        val filtered = if (normalized.isBlank()) {
            publicRecipes
        } else {
            publicRecipes.filter {
                it.title.lowercase().contains(normalized) ||
                    it.country.lowercase().contains(normalized) ||
                    it.ownerName.lowercase().contains(normalized)
            }
        }

        if (filtered.isEmpty()) {
            tvStatus.visibility = View.VISIBLE
            tvStatus.text = if (normalized.isBlank()) "No public SynCook recipes yet." else "No SynCook matches found."
        } else {
            tvStatus.visibility = View.GONE
        }
        publicAdapter.updateRecipes(filtered)
    }

    private fun openCreateDialog(recipe: SynCookRecipe?) {
        val dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_syncook_create, null)
        val etTitle = dialogView.findViewById<EditText>(R.id.etCreateDishName)
        val etCountry = dialogView.findViewById<EditText>(R.id.etCreateCountry)
        val etIngredients = dialogView.findViewById<EditText>(R.id.etCreateIngredients)
        val etProcedures = dialogView.findViewById<EditText>(R.id.etCreateProcedures)
        val etImageUrl = dialogView.findViewById<EditText>(R.id.etCreateImageUrl)
        val preview = dialogView.findViewById<ImageView>(R.id.imgCreatePreview)
        val rgPrivacy = dialogView.findViewById<RadioGroup>(R.id.rgCreatePrivacy)
        val btnUploadImage = dialogView.findViewById<Button>(R.id.btnCreateUploadImage)

        if (recipe != null) {
            etTitle.setText(recipe.title)
            etCountry.setText(recipe.country)
            etIngredients.setText(recipe.ingredients.joinToString("\n"))
            etProcedures.setText(recipe.procedures.joinToString("\n"))
            etImageUrl.setText(recipe.imageUrl ?: "")
            if (recipe.privacy.equals("PRIVATE", ignoreCase = true)) {
                rgPrivacy.check(R.id.rbCreatePrivate)
            } else {
                rgPrivacy.check(R.id.rbCreatePublic)
            }
        }

        btnUploadImage.setOnClickListener {
            pendingImageField = etImageUrl
            pendingImagePreview = preview
            val intent = Intent(Intent.ACTION_GET_CONTENT)
            intent.type = "image/*"
            startActivityForResult(Intent.createChooser(intent, "Select image"), IMAGE_PICK_REQUEST)
        }

        val builder = AlertDialog.Builder(this)
            .setTitle(if (recipe == null) "Create SynCook Dish" else "Edit SynCook Dish")
            .setView(dialogView)
            .setNegativeButton("Cancel", null)
            .setPositiveButton(if (recipe == null) "Upload" else "Save", null)

        val dialog = builder.create()
        dialog.show()

        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
            val title = etTitle.text.toString().trim()
            val country = etCountry.text.toString().trim()
            val ingredients = etIngredients.text.toString()
                .split("\n")
                .map { it.trim() }
                .filter { it.isNotEmpty() }
            val procedures = etProcedures.text.toString()
                .split("\n")
                .map { it.trim() }
                .filter { it.isNotEmpty() }
            val imageInput = etImageUrl.text.toString().trim()
            val imageUrl = resolveImageForSave(imageInput, recipe?.imageUrl)
            val privacy = if (rgPrivacy.checkedRadioButtonId == R.id.rbCreatePrivate) "PRIVATE" else "PUBLIC"

            if (title.isBlank() || country.isBlank() || ingredients.isEmpty() || procedures.isEmpty()) {
                Toast.makeText(this, "Complete all required fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val payload = SynCookRecipePayload(
                title = title,
                country = country,
                ingredients = ingredients,
                procedures = procedures,
                imageUrl = imageUrl,
                privacy = privacy
            )

            uiScope.launch {
                val result = if (recipe == null) {
                    repository.createSynCookRecipe(payload)
                } else {
                    repository.updateSynCookRecipe(recipe.id, payload)
                }

                result.onSuccess {
                    Toast.makeText(
                        this@SynCookActivity,
                        if (recipe == null) "Recipe uploaded" else "Recipe updated",
                        Toast.LENGTH_SHORT
                    ).show()
                    dialog.dismiss()
                    loadSynCook()
                }.onFailure { err ->
                    Toast.makeText(this@SynCookActivity, err.message ?: "Save failed", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun openManageDialog() {
        val dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_syncook_manage, null)
        val tvManageStatus = dialogView.findViewById<TextView>(R.id.tvManageStatus)
        val rvManage = dialogView.findViewById<androidx.recyclerview.widget.RecyclerView>(R.id.rvManageRecipes)

        val manageAdapter = SynCookRecipeAdapter(
            recipes = myRecipes,
            showOwnerActions = true,
            onView = { recipe -> openRecipeDialog(recipe.id) },
            onEdit = { recipe ->
                openCreateDialog(recipe)
            },
            onDelete = { recipe ->
                confirmDelete(recipe)
            }
        )

        rvManage.layoutManager = LinearLayoutManager(this)
        rvManage.adapter = manageAdapter

        tvManageStatus.text = if (myRecipes.isEmpty()) "No personal recipes yet." else "Uploaded: ${myRecipes.size}"

        AlertDialog.Builder(this)
            .setTitle("Personal Collection")
            .setView(dialogView)
            .setPositiveButton("Close", null)
            .show()
    }

    private fun confirmDelete(recipe: SynCookRecipe) {
        AlertDialog.Builder(this)
            .setTitle("Delete recipe")
            .setMessage("Delete '${recipe.title}' permanently?")
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Delete") { _, _ ->
                uiScope.launch {
                    repository.deleteSynCookRecipe(recipe.id)
                        .onSuccess {
                            Toast.makeText(this@SynCookActivity, "Recipe deleted", Toast.LENGTH_SHORT).show()
                            loadSynCook()
                        }
                        .onFailure { err ->
                            Toast.makeText(this@SynCookActivity, err.message ?: "Delete failed", Toast.LENGTH_LONG).show()
                        }
                }
            }
            .show()
    }

    private fun openRecipeDialog(recipeId: Long) {
        val dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_syncook_detail, null)

        val tvTitle = dialogView.findViewById<TextView>(R.id.tvDetailDishName)
        val tvMeta = dialogView.findViewById<TextView>(R.id.tvDetailMeta)
        val tvIngredients = dialogView.findViewById<TextView>(R.id.tvDetailIngredients)
        val tvProcedures = dialogView.findViewById<TextView>(R.id.tvDetailProcedures)
        val tvComments = dialogView.findViewById<TextView>(R.id.tvDetailComments)
        val etComment = dialogView.findViewById<EditText>(R.id.etDetailComment)
        val btnSend = dialogView.findViewById<Button>(R.id.btnDetailSendComment)

        val dialog = AlertDialog.Builder(this)
            .setTitle("SynCook Recipe")
            .setView(dialogView)
            .setPositiveButton("Close", null)
            .create()

        fun render(recipe: SynCookRecipe) {
            tvTitle.text = recipe.title
            tvMeta.text = "${recipe.country} • by ${recipe.ownerName}"
            tvIngredients.text = recipe.ingredients.joinToString("\n") { "• $it" }
            tvProcedures.text = recipe.procedures.mapIndexed { index, step -> "${index + 1}. $step" }.joinToString("\n")
            tvComments.text = if (recipe.comments.isEmpty()) {
                "No comments yet"
            } else {
                recipe.comments.joinToString("\n\n") { "${it.authorName}: ${it.content}" }
            }
        }

        uiScope.launch {
            repository.getSynCookRecipeById(recipeId).onSuccess { recipe ->
                render(recipe)

                btnSend.setOnClickListener {
                    val comment = etComment.text.toString().trim()
                    if (comment.isBlank()) return@setOnClickListener
                    uiScope.launch {
                        repository.addSynCookComment(recipeId, comment)
                            .onSuccess {
                                etComment.text?.clear()
                                repository.getSynCookRecipeById(recipeId).onSuccess { updated ->
                                    render(updated)
                                    loadSynCook()
                                }
                            }
                            .onFailure { err ->
                                Toast.makeText(this@SynCookActivity, err.message ?: "Comment failed", Toast.LENGTH_LONG).show()
                            }
                    }
                }

                dialog.show()
            }.onFailure { err ->
                Toast.makeText(this@SynCookActivity, err.message ?: "Recipe unavailable", Toast.LENGTH_LONG).show()
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != IMAGE_PICK_REQUEST || resultCode != RESULT_OK) return

        val uri = data?.data ?: return
        val base64 = imageUriToDataUrl(uri) ?: return
        pendingImageField?.setText(base64)
        pendingImagePreview?.setImageURI(uri)
    }

    private fun imageUriToDataUrl(uri: Uri): String? {
        return try {
            val input = contentResolver.openInputStream(uri) ?: return null
            val bytes = input.use { stream ->
                val buffer = ByteArrayOutputStream()
                val data = ByteArray(8 * 1024)
                while (true) {
                    val read = stream.read(data)
                    if (read == -1) break
                    buffer.write(data, 0, read)
                }
                buffer.toByteArray()
            }
            val mime = contentResolver.getType(uri) ?: "image/jpeg"
            val encoded = android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP)
            "data:$mime;base64,$encoded"
        } catch (_: Exception) {
            null
        }
    }

    private fun resolveImageForSave(input: String, existing: String?): String? {
        if (input.isBlank()) return existing

        val trimmed = input.trim()
        val validHttp = trimmed.startsWith("http://", ignoreCase = true) ||
            trimmed.startsWith("https://", ignoreCase = true)
        if (validHttp) return trimmed

        // Accept only proper data URL image payloads and keep existing image otherwise.
        val isDataImage = trimmed.startsWith("data:image/", ignoreCase = true)
        val hasBase64Separator = trimmed.contains(";base64,")
        if (isDataImage && hasBase64Separator) {
            val encodedPart = trimmed.substringAfter(";base64,", "")
            if (encodedPart.length > 32) return trimmed
        }

        return existing
    }

    override fun onDestroy() {
        super.onDestroy()
        screenJob.cancel()
    }
}
