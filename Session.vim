let SessionLoad = 1
let s:so_save = &g:so | let s:siso_save = &g:siso | setg so=0 siso=0 | setl so=-1 siso=-1
let v:this_session=expand("<sfile>:p")
silent only
silent tabonly
cd ~/code/personal/node-challenge-task
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
let s:shortmess_save = &shortmess
if &shortmess =~ 'A'
  set shortmess=aoOA
else
  set shortmess=aoO
endif
badd +72 ~/code/farmix/farmix-rp-new/src/main.ts
badd +2 ~/code/personal/node-challenge-task/src/main.ts
badd +7 ~/code/personal/node-challenge-task/src/boot.ts
badd +22 ~/code/personal/node-challenge-task/src/config.ts
badd +24 ~/code/personal/node-challenge-task/src/app.module.ts
badd +11 ~/code/farmix/farmix-rp-new/src/config.ts
badd +3 ~/code/personal/node-challenge-task/tsconfig.jest.json
badd +4 ~/code/personal/node-challenge-task/tsconfig.eslint.json
badd +9 ~/code/personal/node-challenge-task/tsconfig.build.json
badd +17 ~/code/personal/node-challenge-task/tsconfig.json
badd +22 ~/code/farmix/farmix-rp-new/tsconfig.json
badd +32 ~/code/personal/node-challenge-task/README.md
badd +1 ~/code/personal/node-challenge-task/Session.vim
badd +5 ~/code/personal/node-challenge-task/src/data/data-source.ts
badd +3 ~/code/personal/node-challenge-task/src/services/token-price-update.service.ts
badd +1 ~/code/personal/node-challenge-task/src/models/token-price-update-message.ts
badd +2 ~/code/personal/node-challenge-task/src/models/token.schema.ts
badd +9 ~/code/personal/node-challenge-task/docker-compose.yml
badd +42 ~/code/personal/node-challenge-task/src/migrations/1684654321000-InitialMigration.ts
badd +27 ~/code/personal/node-challenge-task/src/migrations/run-migrations.ts
badd +8 ~/code/personal/node-challenge-task/node_modules/@nestjs/typeorm/dist/typeorm.module.d.ts
badd +42 ~/code/personal/node-challenge-task/node_modules/@nestjs/typeorm/dist/interfaces/typeorm-options.interface.d.ts
badd +1 ~/code/personal/node-challenge-task/node_modules/@nestjs/common/interfaces/type.interface.d.ts
badd +22 ~/code/personal/node-challenge-task/node_modules/typeorm/data-source/DataSourceOptions.d.ts
badd +11 ~/code/personal/node-challenge-task/node_modules/typeorm/driver/postgres/PostgresConnectionOptions.d.ts
badd +5 ~/code/personal/node-challenge-task/node_modules/typeorm/driver/postgres/PostgresConnectionCredentialsOptions.d.ts
badd +43 ~/code/personal/node-challenge-task/node_modules/typeorm/data-source/BaseDataSourceOptions.d.ts
badd +6 ~/code/personal/node-challenge-task/node_modules/typeorm/common/MixedList.d.ts
badd +25 package.json
badd +20 ~/code/personal/node-challenge-task/src/migrations/ds.ts
badd +2 ~/code/personal/node-challenge-task/test/db/token.seeder.ts
badd +18 ~/code/personal/node-challenge-task/test/db/seed.ts
badd +85 ~/code/farmix/farmix-rp-new/package.json
badd +1 ~/code/personal/node-challenge-task/package-lock.json
badd +21 ~/code/personal/node-challenge-task/src/migrations/1761591992397-NormalizeChains.ts
badd +9 ~/code/personal/node-challenge-task/src/migrations/1761591998247-NormalizeLogos.ts
badd +7 ~/code/personal/node-challenge-task/src/migrations/1761592045949-NormalizePrices.ts
badd +95 ~/code/personal/node-challenge-task/CHANGES.md
badd +52 ~/code/personal/node-challenge-task/src/migrations/1761592080369-CleanTokens.ts
badd +89 ~/code/personal/node-challenge-task/src/models/entities.ts
badd +4 ~/code/personal/node-challenge-task/src/models/schemas.ts
badd +17 ~/code/personal/node-challenge-task/src/shared/kafka/kafka-producer.service.ts
badd +10 ~/code/personal/node-challenge-task/src/modules/token-prices/token-prices.module.ts
badd +63 ~/code/personal/node-challenge-task/src/modules/token-prices/token-prices.service.ts
badd +34 ~/code/personal/node-challenge-task/src/modules/token-prices/token-prices.scheduler.ts
badd +4 ~/code/personal/node-challenge-task/src/modules/token-prices/services.ts
badd +1 ~/code/personal/node-challenge-task/src/modules/token-prices/tokens.ts
badd +69 ~/code/personal/node-challenge-task/node_modules/typeorm/query-builder/SelectQueryBuilder.d.ts
badd +289 ~/code/personal/node-challenge-task/node_modules/typeorm/repository/Repository.d.ts
badd +15 ~/code/personal/node-challenge-task/node_modules/typeorm/find-options/FindOneOptions.d.ts
badd +380 ~/code/personal/node-challenge-task/node_modules/typeorm/entity-manager/EntityManager.d.ts
badd +4 ~/code/personal/node-challenge-task/src/shared/prices/mock-price.service.ts
badd +1 ~/code/personal/node-challenge-task/src/modules/token-prices/index.ts
badd +3 ~/code/personal/node-challenge-task/.dev.env
badd +7 ~/code/personal/node-challenge-task/.env-cmdrc
badd +6 ~/code/personal/node-challenge-task/node_modules/@nestjs/schedule/dist/decorators/interval.decorator.d.ts
badd +1 ~/code/personal/node-challenge-task/test/db/schema.ts
badd +198 ~/code/personal/node-challenge-task/test/integration/token-price-service.spec.ts
argglobal
%argdel
$argadd ./
set stal=2
tabnew +setlocal\ bufhidden=wipe
tabrewind
tabnext
edit NeogitStatus
argglobal
balt ~/code/personal/node-challenge-task/test/integration/token-price-service.spec.ts
setlocal foldmethod=expr
setlocal foldexpr=v:lua.require'lazyvim.util'.ui.foldexpr()
setlocal foldmarker={{{,}}}
setlocal foldignore=#
setlocal foldlevel=99
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldenable
let s:l = 1 - ((0 * winheight(0) + 25) / 51)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 1
normal! 0
tabnext 2
set stal=1
if exists('s:wipebuf') && len(win_findbuf(s:wipebuf)) == 0 && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20
let &shortmess = s:shortmess_save
let s:sx = expand("<sfile>:p:r")."x.vim"
if filereadable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &g:so = s:so_save | let &g:siso = s:siso_save
set hlsearch
let g:this_session = v:this_session
let g:this_obsession = v:this_session
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
