#!/bin/bash

# Docker build script for HackTX25 Backend
# Usage: ./scripts/docker-build.sh [dev|prod] [tag]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="prod"
TAG="latest"
IMAGE_NAME="hacktx25-backend"

# Parse arguments
if [ $# -ge 1 ]; then
    ENVIRONMENT=$1
fi

if [ $# -ge 2 ]; then
    TAG=$2
fi

# Validate environment
if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
    echo -e "${RED}Error: Environment must be 'dev' or 'prod'${NC}"
    exit 1
fi

echo -e "${BLUE}Building Docker image for HackTX25 Backend${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Tag: ${TAG}${NC}"
echo -e "${YELLOW}Image: ${IMAGE_NAME}:${TAG}${NC}"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found. Make sure to set environment variables.${NC}"
fi

# Build the image
if [ "$ENVIRONMENT" = "dev" ]; then
    echo -e "${BLUE}Building development image...${NC}"
    docker build -f Dockerfile.dev -t ${IMAGE_NAME}:${TAG} .
    docker tag ${IMAGE_NAME}:${TAG} ${IMAGE_NAME}:dev
else
    echo -e "${BLUE}Building production image...${NC}"
    docker build -f Dockerfile -t ${IMAGE_NAME}:${TAG} .
    docker tag ${IMAGE_NAME}:${TAG} ${IMAGE_NAME}:prod
fi

echo ""
echo -e "${GREEN}✅ Docker image built successfully!${NC}"
echo -e "${GREEN}Image: ${IMAGE_NAME}:${TAG}${NC}"

# Show image info
echo ""
echo -e "${BLUE}Image information:${NC}"
docker images | grep ${IMAGE_NAME}

echo ""
echo -e "${BLUE}To run the container:${NC}"
if [ "$ENVIRONMENT" = "dev" ]; then
    echo -e "${YELLOW}docker-compose -f docker-compose.dev.yml up${NC}"
else
    echo -e "${YELLOW}docker-compose up${NC}"
fi

echo ""
echo -e "${BLUE}To run without docker-compose:${NC}"
echo -e "${YELLOW}docker run -p 3000:3000 --env-file .env ${IMAGE_NAME}:${TAG}${NC}"

