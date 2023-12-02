npm run build
cd dist
rsync -avz --progress --exclude '.DS_Store' * boscoh@boscoh.com:boscoh.com/popjs/

