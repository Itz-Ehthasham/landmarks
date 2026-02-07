pipeline {
  agent any

  tools {
    nodejs 'node-20'
  }

  options {
    timeout(time: 30, unit: 'MINUTES')
  }

  environment {
    SONAR_SCANNER_HOME = tool 'SonarScanner'
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

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('SonarQube') {
          sh "${SONAR_SCANNER_HOME}/bin/sonar-scanner"
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 5, unit: 'MINUTES') {
          script {
            def qg = waitForQualityGate()
            echo "Quality Gate status: ${qg.status}"
            if (qg.status != 'OK') {
              error "Pipeline failed due to Quality Gate: ${qg.status}"
            }
          }
        }
      }
    }
  }

  post {
    always {
      script {
        cleanWs()
      }
    }
  }
}
