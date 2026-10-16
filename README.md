# SnowdropID

[Türkçe](#türkçe) · [English](#english) · [MIT](LICENSE)

## Türkçe

### Amaç ve sınırlar

SnowdropID, Discord sunucusunda çalışan gerçek bir Gateway botudur. `/snowdropid`, elle girdiğiniz sayısal Discord kimliğindeki zamanı hesaplar; UTC, Discord'un yerelleştirdiği tarih ve göreli tarihi yalnızca size gösterir. Topluluk üyeleri ve sunucu yöneticileri, bir kimliğin tarihini başka sitelere göndermeden inceleyebilir ve Discord tarih biçimlerini öğrenebilir.

**Sonuç bir doğrulama değildir.** Sayı uydurma veya başka bir nesneye ait olabilir. Bot nesnenin varlığını, türünü, sahibini, hesabın güvenilirliğini, sunucuya katılma tarihini veya son etkinliğini sorgulamaz. Otomatik moderasyon, yaş doğrulaması veya güven kararı için kullanmayın. Discord kimlikleri aynı zaman düzenini kullandığından, mesaj, kanal, sunucu ve kullanıcı kimlikleri birbirinden yalnızca sayıyla ayırt edilemez. Bazı alt nesneler üst nesne kimliğini paylaşabilir.

### Özellikler

- BigInt ile tam 64 bit çözümleme; milisaniyeli ISO UTC çıktısı.
- Özel tarih önizlemesi, **Rapor**, **Tarih biçimleri**, **Kapat** düğmeleri.
- Yedi tarih biçimi (`t T d D f F R`); kodları elle kopyalayabilirsiniz. Düğmeler panoya otomatik yazmaz.
- Türkçe/İngilizce; dil seçilmezse Discord etkileşim dili kullanılır (Türkçe dışındaki dillerde İngilizce).
- Beş dakikalık, kullanıcı/sunucu/kanal/yanıt/uygulama bağlı geçici raporlar; açık hata mesajları.
- Mesaj okuma, nesne arama, DM, public gönderim, dosya eki, veritabanı, izleme veya harici servis yok.

### Gereksinimler

Windows, macOS veya Linux; [Node.js 24 LTS](https://nodejs.org/en/download) (24.13 veya sonrası, 25 öncesi); internete erişim; kendi Discord uygulamanız ve bot tokenınız; botu davet edebileceğiniz bir sunucu. Kaynak indirme/yayımlama botu çalıştırmaz. Her kurulum tek sunucu ve tek sürekli çalışan süreç içindir. Git gerekli değildir: bu deponun **Code → Download ZIP** seçeneğini kullanıp arşivi açabilirsiniz.

### Developer Portal ve kurulum

1. [Discord Developer Portal](https://discord.com/developers/applications) → **New Application**. Uygulama adı belirleyin. Bu bot için ayrı uygulama kullanın.
2. **General Information** sayfasından **Application ID** değerini kopyalayın; bu Client Secret değildir.
3. **Bot** sayfasında bot kullanıcısını oluşturun (portal otomatik oluşturmuş olabilir). **Reset Token** ile tokenı alın. Tokenı kimseye göndermeyin; ekran görüntüsü, GitHub, sohbet veya issue içine koymayın. Yalnızca bot tokenı kullanın, kullanıcı tokenı kullanmayın.
4. **Privileged Gateway Intents** altında Presence, Server Members ve Message Content kapalı kalsın. Public Bot seçeneğini kendi kurulum politikanıza göre kapatabilirsiniz; bu kaynak deponun public olmasıyla aynı şey değildir.
5. **Installation** bölümünde **Guild Install** kullanın; User Install gerekmez. `bot` ve `applications.commands` kapsamları, yalnızca **View Channel / Kanalı Görüntüle** izni seçilsin. **Administrator**, Send Messages, Read Message History, Manage Server ve Manage Roles vermeyin. İzin sayısı `1024`.
6. Discord **Kullanıcı Ayarları → Gelişmiş → Geliştirici Modu** seçeneğini açın. Sunucu simgesine sağ tıklayıp **Sunucu ID'sini Kopyala** seçin; mobilde sunucu menüsünü kullanın.
7. Kaynak klasörünü açın. Windows'ta `setup.cmd` dosyasına çift tıklayın. macOS/Linux'ta klasörde terminal açıp `bash setup.sh` çalıştırın. Node yeni kurulduysa terminali yeniden açın. Kurulum kilit dosyasındaki bağımlılıkları yükler ve sizden Application ID, Server ID ve gizli token ister. Token yazılırken görünmez; boşluk veya satır sonu olmadan yapıştırıp Enter'a basın. Kaynak kod düzenlemek gerekmez.
8. Kurulumun yazdırdığı **Davet** bağlantısını açın; doğru sunucuyu seçin ve izinleri inceleyin. Bir sunucu yöneticisi gerekebilir. Kanal izinleri botun Kanalı Görüntüle iznini engelliyorsa gerekli kanalda izin verin. Yönetici yetkisi vermeyin.
9. Windows'ta `register.cmd`; macOS/Linux'ta `bash register.sh`. Bu yalnızca yapılandırılan sunucuda `/snowdropid` komutunu oluşturur/günceller; diğer komutları topluca silmez. Aynı uygulamanın aynı adlı mevcut komutunu günceller; ayrı uygulama bu yüzden önerilir.
10. Windows'ta `start.cmd`; macOS/Linux'ta `bash start.sh`. **SnowdropID ready / hazır** görünürken süreç açık kalsın. Discord'da komutu deneyin. Kapatmak için Ctrl+C.

### Yapılandırma

Kurulum `.env` dosyasını yerelde oluşturur ve mevcut dosyanın üzerine yazmaz. `DISCORD_TOKEN` bot tokenı, `DISCORD_APPLICATION_ID` uygulama ID'si, `DISCORD_GUILD_ID` sunucu ID'sidir. Alternatif olarak bu üç değişkeni hosting sağlayıcınızın secrets paneline girip `npm ci --ignore-scripts`, `npm run register`, `npm start` çalıştırın. Node `.env` yüklediğinde önceden tanımlı ortam değişkenleri önceliklidir. Çalışma dizini bot klasörü olmalıdır. Token kaynak koda konmaz.

Yeniden kurulum için botu durdurun, eski `.env` dosyasını klasör dışında güvenli bir konuma taşıyın ve yardımcısını tekrar çalıştırın. Eski token sızdıysa Portal'da yenileyin; önceki token artık çalışmaz. `.env.example` boş alanları gösterir ve gerçek token içermez.

### Kullanım

1. Discord'da incelemek istediğiniz nesnenin **ID'yi Kopyala** seçeneğini kullanın. Özel mesaj bağlantısı, kullanıcı etiketi veya URL yapıştırmayın; yalnızca sayıyı girin. Başka kişilere ait kimlikleri gereksiz yere paylaşmayın.
2. `/snowdropid id:175928847299117063 language:tr` çalıştırın. Bu resmi belge örneği `2016-04-30T11:18:25.796Z` verir; varlığı doğrulanmaz.
3. Özel rapor UTC ve yerel tarihi gösterir. **Tarih biçimleri** tüm biçimleri ve kopyalanabilir metinlerini açar; **Rapor** sade görünüme döner. Kodları elle kopyalamak ve başka yere göndermek sizin seçiminizdir.
4. **Kapat** yanıtı kapanış metniyle değiştirir ve geçici kaydı siler. Yanıtın kendisini silmez. Süre dolunca veya bot yeniden başlayınca eski özel metin Discord'da kalabilir; düğmeler çalışmaz. Yeni komut açın.

UTC çıktısı milisaniyeyi korur; Discord tarih kodları saniyeye aşağı yuvarlanır. Yerel görünüm ve göreli zaman Discord istemcinizin ayarlarına bağlıdır. Geleceği kodlayan sayılar reddedilir; bot makinesinin saati doğru olmalıdır. Çok eski küçük pozitif sayılar da hesaplanabilir; bu onların gerçek bir ID olduğunu göstermez. Boşluk, işaret, baştaki sıfır ve 64 bit dışı sayılar reddedilir.

### İzinler, güvenlik ve gizlilik

Gateway intent yalnızca **Guilds**. Bot **View Channel** ister; özel etkileşim yanıtları için genel kanala mesaj yazma izni gerekmez. Üyenin kanalı görmesi ve Discord'da uygulama komutlarını kullanabilmesi gerekir; bot yapılandırılan sunucu ve etkileşim izinlerini her tıklamada kontrol eder. Botun etkin Administrator izni varsa işlem reddedilir. Diğer gereksiz izinleri kurulumda siz kaldırmalısınız.

Hesap yereldir; girilen ID için Discord nesne/üye/mesaj sorgusu yapılmaz. Discord yine komutu ve özel yanıtı işler; özel yanıt uçtan uca şifreleme garantisi değildir. Çalışan operatör süreç belleğini okuyabilir. RAM'de ID, sonuç, dil, kullanıcı/sunucu/kanal/yanıt kimlikleri en fazla 5 dakika tutulur; 30 saniyelik temizleme aralığı nedeniyle en çok yaklaşık 30 saniye ek fiziksel kalıntı olabilir, erişim süre sonunda hemen reddedilir. Kapat ve süreç durması kaydı kaldırır. En çok 100 rapor, 1000 kısa bekleme kaydı; kullanıcı/sunucu başına 5 saniye yeni komut, rapor başına 1 saniye tıklama aralığı. Bunlar dağıtık veya sunucu genelinde spam koruması değildir; gerektiğinde Discord'un komut izinleriyle erişimi sınırlayın.

Mesaj/üye/kullanıcı önbellekleri kapalıdır; Gateway kütüphanesi sunucu/kanal gibi işletim metaverilerini bellekte tutabilir. Uygulama etkileşim girdilerini, ID'leri veya tokenı loglamaz; yalnızca sabit durum/hata mesajları yazar. Veritabanı, analitik veya telemetri yok. Hosting operatörünün erişim/yedek/log politikasını ayrıca inceleyin. `.env` gitignore içindedir; Unix'te `0600` oluşturulur, Windows'ta işletim sistemi klasör erişimlerini sınırlayın. REST tekrarları kapalıdır; oran sınırı/hata durumunda otomatik istek tekrarı yok, Gateway yeniden bağlanması kütüphane tarafından yönetilir.

### Botu çalışır tutma

Terminalin kapanması, bilgisayarın uyuması veya hosting sürecinin durması botu kapatır. Sürekli hizmet için Node 24 destekli güvenilir bir sunucuda tek süreç çalıştırın; sağlayıcınızın süreç yeniden başlatma/secrets araçlarını kullanın. Web sunucusu veya inbound port gerekmez; Discord'a outbound HTTPS/WebSocket gerekir. Uyuyan ücretsiz hosting sürekli çalışmayı garanti etmez. Güncellemeden önce süreci durdurun, `.env` dosyasını güvenli tutun, yeni kaynakları alın, `npm ci --ignore-scripts` çalıştırıp yeniden başlatın; komut yapısı değiştiyse tekrar register yapın. Aynı tokenla birden fazla kopya başlatmayın.

### Sorun giderme

- **node/npm bulunamadı:** Node 24 LTS kurun; yeni terminal açın ve `node --version` kontrol edin.
- **.env zaten var:** yardımcısı güvenli şekilde üzerine yazmayı reddeder; yeniden kurulum adımlarını izleyin.
- **Kurulum TTY istiyor:** dosyayı gerçek etkileşimli terminalde çalıştırın; yönlendirilmiş stdin, CI ve bazı IDE çıktı panelleri token girişi için uygun değildir.
- **Komut görünmüyor:** doğru sunucu ID'si, davet kapsamları ve register sonucu kontrol edilsin; Discord'u yenileyin. Sunucu Integrations/uygulama komut izinleri erişimi engelleyebilir.
- **Başlatma/kayıt başarısız:** tokenı paylaşmadan Portal'daki bot tokenını, uygulama/sunucu ID'lerini, daveti, Node sürümünü ve bağlantıyı kontrol edin. Uygulama ID'si botla eşleşmelidir.
- **Erişim hatası:** yapılandırılan sunucuda kullanın; kanalın View Channel izinlerini kontrol edin ve bottan Administrator'ı kaldırın.
- **Geçersiz veya gelecek tarih:** yalnızca Copy ID sayısını girin; sıfır/boşluk/URL kullanmayın, sunucu saatini eşitleyin. Sayının geçerli biçimi nesnenin varlığını garanti etmez.
- **Düğme süresi doldu veya kapasite dolu:** yeni komut açın; birkaç saniye bekleyin. Yeniden başlatma tüm geçici raporları bitirir.
- **Discord yanıt vermedi:** bağlantı/oran sınırı olabilir; bekleyip yeni komut açın. Tokenı, girdiyi veya özel çıktıyı issue'ya koymayın.

### Testler ve katkı

Geliştirme için `npm ci --ignore-scripts`, `npm run check`, `npm audit --audit-level=low`. `check`: önerilen Biome lint/format kuralları, sıkı TypeScript (bağımlılık türleri dahil), Node testleri, bağımlılık lisans/registry/SHA-512/install-script ve kaynak credential-pattern kontrolleri. Tarama tüm gizli bilgi türlerini bulma garantisi değildir. CI Windows, Ubuntu ve macOS 15 Intel'de bunları, Node yardımcı sözdizimini, `bash -n setup.sh register.sh start.sh` ve temiz Git farkını kontrol eder; salt okunur izin ve SHA ile sabitlenmiş Actions kullanır.

Testler Discord etkileşimlerini taklit eder; canlı token/sunucu gerekmez. Kesin tarih aritmetiği, 10.000 bağımsız zaman örneği, alt bitler, sınırlar, izin/binding/kapasite/eşzamanlılık/süre, gizli terminal girişinin taklidi ve yapılandırılmamış gerçek giriş noktalarının güvenli çıkışı kapsanır. Yayınlanmış kaynak canlı kurulumu doğrulamaz: davet, gerçek komut/düğmeler, terminalde gizli token, mobil/ekran okuyucu ve sürekli hosting operatör tarafından denenmelidir.

Hata raporu/PR için [CONTRIBUTING](CONTRIBUTING.md), gizlilik için [PRIVACY](PRIVACY.md), güvenlik için [SECURITY](SECURITY.md). **MIT lisansı**, [LICENSE](LICENSE). Kimlikleri veya tokenları issue'lara koymayın.

## English

### Purpose and limits

SnowdropID is a real Discord Gateway bot running in your server. `/snowdropid` decodes the creation timestamp embedded in a manually entered numeric Discord ID and privately displays UTC, viewer-local and relative dates. Community members and organizers can inspect timestamps without sending IDs to a third-party lookup website and learn Discord date formatting.

**The result is not verification.** A number may be invented or refer to another object. The bot does not check existence, type, ownership, trust, server join date or activity. Do not use it for automated moderation, age verification or trust decisions. User, message, channel and server IDs use the same time structure; their type cannot be inferred from the number alone. Some child objects may share their parent's ID.

### Features

- Exact 64-bit BigInt decoding and millisecond ISO UTC output.
- Private date preview with **Report**, **Date formats**, **Close** buttons.
- Seven formats (`t T d D f F R`), manually copyable code; no automatic clipboard access.
- English/Turkish, selected explicitly or inferred from interaction locale (English fallback).
- Five-minute reports bound to requester/server/channel/response/application; clear failure messages.
- No message reading, object lookup, DMs, public posting, attachments, database, analytics or external service.

### Requirements

Windows, macOS or Linux; [Node.js 24 LTS](https://nodejs.org/en/download), version 24.13+ below 25; outbound internet; your own Discord application/bot token and a server where you can install it. Publishing or downloading this repository does not run the bot. Each installation supports one configured server and one always-on process. Git is optional: choose **Code → Download ZIP** and extract the archive.

### Developer Portal and installation

1. Open the [Discord Developer Portal](https://discord.com/developers/applications), choose **New Application** and name it. Use a dedicated application for this bot.
2. Copy **Application ID** from **General Information**; this is not the Client Secret.
3. On **Bot**, create the bot user if needed and obtain its token with **Reset Token**. Never share it, screenshot it or put it in GitHub/chat/issues. Use a bot token, never a user token.
4. Leave Presence, Server Members and Message Content **Privileged Gateway Intents** off. The Public Bot setting is your install policy; it is unrelated to the repository's public visibility.
5. Under **Installation**, use **Guild Install**, scopes `bot` and `applications.commands`, permission **View Channel** only (`1024`). Do not grant Administrator, Send Messages, Read Message History, Manage Server or Manage Roles. User Install is unnecessary.
6. Enable Discord **User Settings → Advanced → Developer Mode**. Right-click the server icon and select **Copy Server ID**; on mobile use the server menu.
7. Open the extracted folder. On Windows double-click `setup.cmd`; on macOS/Linux open a terminal there and run `bash setup.sh`. If Node was just installed, reopen the terminal. Setup installs the locked dependencies and asks for Application ID, Server ID and a hidden token. Type or paste the token without whitespace, then press Enter; token characters are not echoed. No source editing is required.
8. Open the install URL printed by setup, select the server and review permissions. A server manager may be needed. Allow View Channel in the intended channels if overwrites deny it; do not grant Administrator.
9. Run `register.cmd` on Windows or `bash register.sh` on macOS/Linux. It creates/updates `/snowdropid` only in the configured server and does not bulk-delete other commands. It updates an existing command with the same name in the same application; use a dedicated app.
10. Run `start.cmd` or `bash start.sh`. Keep the process running after **SnowdropID ready / hazır** appears. Try the command in Discord. Ctrl+C stops it.

### Configuration

Setup creates a local `.env` and refuses to overwrite one. `DISCORD_TOKEN` is the bot token, `DISCORD_APPLICATION_ID` the application ID and `DISCORD_GUILD_ID` the server ID. Alternatively enter these variables in a hosting provider's secrets panel, then run `npm ci --ignore-scripts`, `npm run register` and `npm start`. Existing environment variables take precedence when Node loads `.env`. Run from the bot folder. Never put a token in source code.

To reconfigure, stop the bot, move the old `.env` securely outside the folder and rerun setup. Rotate any exposed token in the Portal; the old token stops working. `.env.example` contains blank fields only.

### Usage

1. Use Discord's **Copy ID** on the object you want to inspect. Enter the number, not a URL, mention or private message link. Avoid unnecessary sharing of other people's identifiers.
2. Try `/snowdropid id:175928847299117063 language:en`. This documentation example decodes to `2016-04-30T11:18:25.796Z`; existence is not checked.
3. The private report shows UTC and local dates. **Date formats** reveals the seven rendered styles and copyable code; **Report** returns to the short view. You choose whether to copy and post a code manually elsewhere.
4. **Close** replaces the response with closure text and removes its temporary record; it does not delete the Discord response. Old private text can remain after expiry/restart, but controls stop working. Open a new command.

ISO UTC preserves milliseconds. Discord date codes floor to whole seconds; local rendering and relative time follow the Discord client's settings. Future-encoded numbers are rejected; the bot computer's clock must be correct. Very small positive numbers can be decoded but are not proven real IDs. Whitespace, signs, leading zeroes and numbers beyond unsigned 64 bits are rejected.

### Permissions, security and privacy

Only the **Guilds** Gateway intent and **View Channel** bot permission are needed. Private interaction replies do not require public Send Messages permission. Members need channel visibility and Discord application-command access. Every click checks configured server and interaction permissions; effective bot Administrator permission is refused. Remove other unnecessary permissions during installation.

The calculation is local; there are no object/member/message lookups for the submitted number. Discord still processes commands/private responses; ephemeral does not mean end-to-end encrypted. The operator can inspect process memory. RAM stores the input ID, result, language and requester/server/channel/response identifiers for five minutes. Physical cleanup runs every 30 seconds, so an expired record may remain up to roughly 30 more seconds, while access is rejected immediately at expiry. Close/process termination removes records. Limits: 100 reports, 1000 short cooldown records, five seconds between commands per member/server, one second between clicks per report. These are not distributed or server-wide spam protection; restrict application command access in Discord if needed.

Message/member/user caches are disabled; the Gateway library may retain operational guild/channel metadata. The application logs fixed status/failure messages, never interaction content, IDs or tokens. No database, analytics or telemetry. Review your hosting provider's access/backup/log policies separately. `.env` is ignored by Git and created with mode `0600` on Unix; restrict folder access on Windows. REST retries are disabled and rate-limit responses are rejected without automatic repetition; the library manages Gateway reconnects.

### Keeping it online

Closing the terminal, computer sleep or host shutdown stops the bot. Use a trusted Node 24 host with one persistent process and its process-restart/secrets tools. No web server/inbound port is needed; outbound Discord HTTPS/WebSocket connectivity is required. Sleeping free hosts do not guarantee continuous service. For updates stop the process, protect `.env`, obtain the new source, run `npm ci --ignore-scripts` and restart; rerun registration if command shape changes. Do not run multiple copies with one token.

### Troubleshooting

- **node/npm missing:** install Node 24 LTS, reopen terminal and check `node --version`.
- **.env exists:** setup deliberately refuses overwriting; follow reconfiguration above.
- **TTY required:** use an interactive terminal; redirected stdin, CI and some IDE output panels cannot accept hidden input.
- **Command absent:** check server ID, install scopes, registration result and server Integrations/command restrictions; refresh Discord.
- **Startup/registration failed:** privately check bot token, app/server IDs, installation, Node version and network. Application ID must match the bot user.
- **Access refused:** use the configured server, check View Channel overwrites and remove bot Administrator permission.
- **Invalid/future time:** paste only Copy ID digits without zero prefixes, whitespace or links; synchronize host clock. Valid syntax does not prove existence.
- **Expired control/capacity:** open a new command or wait briefly. Restart ends all reports.
- **No Discord response:** connectivity/rate limits may be responsible; wait and try a new command. Never paste a token, input ID or private report into an issue.

### Tests, contribution and license

Run `npm ci --ignore-scripts`, `npm run check` and `npm audit --audit-level=low`. `check` runs recommended Biome lint/format rules, strict TypeScript including dependency types, Node tests and dependency license/registry/SHA-512/install-script plus source credential-pattern checks. Pattern scans cannot guarantee discovery of every secret. Read-only SHA-pinned CI runs these on Windows, Ubuntu and macOS 15 Intel, checks Node helper syntax, `bash -n setup.sh register.sh start.sh` and a clean Git diff.

Tests mock Discord interactions and terminal input; no live token/server is needed. Coverage includes exact arithmetic, 10,000 independent time examples, lower bits, bounds, permissions/binding/capacity/concurrency/expiry, hidden-input behavior and safe real unconfigured entrypoint exits. Publication does not validate live operation: the operator must test installation, actual commands/buttons, real hidden-token entry, mobile/screen-reader behavior and continuous hosting.

See [CONTRIBUTING](CONTRIBUTING.md), [PRIVACY](PRIVACY.md), [SECURITY](SECURITY.md). Licensed under **MIT**, see [LICENSE](LICENSE). Never include tokens or private IDs in issues.

## Official references / Resmî kaynaklar

- [Discord snowflake structure](https://docs.discord.com/developers/reference#snowflakes)
- [Application commands](https://docs.discord.com/developers/interactions/application-commands)
- [Interaction replies and ephemeral responses](https://docs.discord.com/developers/interactions/receiving-and-responding)
- [Gateway](https://docs.discord.com/developers/events/gateway)
- [Permissions](https://docs.discord.com/developers/topics/permissions)
- [Copying Discord IDs](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID)
- [Developer Policy](https://support-dev.discord.com/hc/en-us/articles/8563934450327-Discord-Developer-Policy)
