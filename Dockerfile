FROM registry.access.redhat.com/ubi9/python-312

WORKDIR /opt/app-root/src

COPY . .

EXPOSE 8080

CMD ["python3", "-m", "http.server", "8080", "--bind", "0.0.0.0"]
