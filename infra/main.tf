terraform {
  required_providers {
    render = {
      source  = "render-oss/render"
      version = "1.3.0"
    }
  }

  required_version = ">= 1.6.0"
}

provider "render" {
  api_key = var.render_api_key
}

resource "render_web_service" "muro_app" {
  name         = "muro-app-tf"
  plan         = "free"
  runtime_source = {
    type = "github"
    repo = "Catriel-Escobar/proyecto-integrador-devops"
    branch = "main"
    docker = {
      dockerfile_path = "Dockerfile"
      context_path = "."
      dockerfile_name = "Dockerfile"
      auto_deploy = true
    }
  }
  region = "Oregon, USA"
  env_vars = {
    PORT          = "3000"
    MONGODB_URI   = var.mongodb_uri
  }
}
