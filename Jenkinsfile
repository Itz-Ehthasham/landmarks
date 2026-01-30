pipeline {
  agent any

  tools {
    nodejs 'node-20'
  }

  options {
    timeout(time: 15, unit: 'MINUTES')
  }

  stages {
    stage('Install') {
      steps {
        sh 'node -v'
        sh 'npm -v'
        sh 'npm ci --prefer-offline --no-audit'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }

    stage('TypeCheck') {
      steps {
        sh 'npm run typecheck'
      }
    }

    stage('Test') {
      steps {
        sh 'npm run test --if-present'
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}
