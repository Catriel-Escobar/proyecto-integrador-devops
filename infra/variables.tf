variable "render_api_key" {
  description = "API Key de Render"
  type        = string
  sensitive   = true
}

variable "mongodb_uri" {
  description = "Connection string de MongoDB Atlas"
  type        = string
  sensitive   = true
}
