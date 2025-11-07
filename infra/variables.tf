variable "render_api_key" {
  description = "API Key de Render"
  type        = string
  sensitive   = true
}

variable "mongodb_uri" {
  description = "URI de conexión a MongoDB Atlas"
  type        = string
  sensitive   = true
}

variable "render_owner_id" {
  description = "El Owner ID de la cuenta de Render"
  type        = string
}
