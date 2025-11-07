terraform {
  required_providers {
    render = {
      source  = "render-oss/render"
      version = "~> 0.1.0"
    }
  }
  required_version = ">= 1.3.0"
}


provider "render" {
  api_key = var.render_api_key
}

resource "render_web_service" "muro_app" {
  name  = "muro-app-tf"
  plan  = "free"
  region = "oregon" # usa el código corto, no "Oregon, USA"

  runtime_source {
    type     = "github"
    repo_url = "https://github.com/Catriel-Escobar/proyecto-integrador-devops"
    branch   = "main"

    docker {
      dockerfile_path = "Dockerfile"
      context_path    = "."
      auto_deploy     = true
    }
  }

  env_vars = [
    {
      key   = "PORT"
      value = "3000"
    },
    {
      key   = "MONGODB_URI"
      value = var.mongodb_uri
    }
  ]
}
