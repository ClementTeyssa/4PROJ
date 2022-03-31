FROM mongo:4.2.5

COPY dump.json /tmp/dump.json

CMD mongoimport --host bdd.295114-293042-292621-4pjt.tk --port 27017 --authenticationDatabase admin --username root --password S3cr3t --db 4proj --collection Clients --type json --file /tmp/dump.json

# AJOUTER DES DONNEES AU DUMP