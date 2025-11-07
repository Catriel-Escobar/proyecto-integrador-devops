terraform {
  required_providers {
    render = {
      source = "render-oss/render"
      version = "1.7.5"
    }
  }
}

provider "render" {
  api_key = var.render_api_key
  owner_id = var.render_owner_id
}

resource "render_web_service" "muro_app_tf" {
  name   = "muro-app-tf"
  plan   = "starter"
  region = "oregon"
  runtime_source = {
    docker = {
      repo_url        = "https://github.com/Catriel-Escobar/proyecto-integrador-devops"
      branch          = "main"
      dockerfile_path = "Dockerfile"
      auto_deploy = true
    }
  }

  env_vars = {
    PORT = {
      value = "3000"
    }
    MONGODB_URI = {
      value = var.mongodb_uri
    }
  }
}