-- ==============================================================================
-- السكربت الشامل لإضافة قسم ورد الليكو الجاهز والـ 41 منتجاً لقاعدة بيانات Supabase / PostgreSQL
-- المتجر: كازاكي (Kazaki.iq)
-- القسم: ورد الليكو الجاهز (id: flowers)
-- ==============================================================================

-- 1. التأكد من وجود القسم وتحديث بياناته أو إضافته
INSERT INTO categories (
    id,
    name,
    name_en,
    name_ku,
    description,
    description_en,
    description_ku,
    image,
    icon
)
VALUES (
    'flowers',
    'ورد الليكو الجاهز',
    'Ready Lego Flowers',
    'گوڵی لێکۆی ئامادەکراو',
    'تشكيلة فاخرة من زهور الليكو المركبة والمجهزة بالكامل، بتصاميم وألوان تحاكي الطبيعة برونق تركيبي لا يذبل أبداً.',
    'A luxury collection of pre-assembled ready Lego flowers in vibrant colors and botanical designs that never wilt.',
    'کۆمەڵەیەکی شاز لە گوڵی لێکۆی ئامادەکراو و بەستراو بە ڕەنگ و دیزاینی سەرسوڕهێنەر کە هەرگیز پەژمورردە نابێت.',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-01.jpeg',
    'Sparkles'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    name_en = EXCLUDED.name_en,
    name_ku = EXCLUDED.name_ku,
    description = EXCLUDED.description,
    description_en = EXCLUDED.description_en,
    description_ku = EXCLUDED.description_ku,
    icon = EXCLUDED.icon;

-- 2. إدراج كافة الـ 41 منتجاً مع أوصاف دقيقة ومعاني الألوان
INSERT INTO products (
    id, title, description, price, original_price, category_id,
    image, gallery, in_stock, stock_count, rating, reviews_count,
    is_featured, is_new, volume_or_size, tags
)
VALUES
(
    'prod-lego-ready-01',
    'زهرة الكلماتيس البنفسجية الملكية',
    'زهرة كلماتيس أنيقة ببتلات بنفسجية عريضة متدرجة وقلب بارز من حبيبات الليكو الصفراء. يرمز اللون البنفسجي للفخامة والنبل والوفاء الصادق، بينما يرمز الأصفر في القلب للحكمة والذكاء والوضوح. تحفة لتزيين المكاتب وزوايا القراءة الراقية.',
    7500, 9000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-01.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-01.jpeg', '/images/ready-lego-flowers/flower-01.jpeg'],
    TRUE, 25, 5.0, 3, FALSE, TRUE, 'ارتفاع 26 سم - قطعة واحدة جاهزة',
    ARRAY['ورد ليكو جاهز', 'كلماتيس', 'بنفسجي ملكي', 'تحف مكتبية']
),
(
    'prod-lego-ready-02',
    'زهرة الأليوم الكروية البنفسجية',
    'تصميم هندسي متقن يحاكي زهرة الأليوم البرية برأس كروي ساحر يجمع عشرات المكعبات المتناسقة. يرمز اللون البنفسجي الأرجواني إلى السكينة النفسية والغموض الساحر والتأمل، والأصفر يرمز للأمل المتجدد والتفرد الفني.',
    8000, 10000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-02.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-02.jpeg', '/images/ready-lego-flowers/flower-02.jpeg'],
    TRUE, 20, 5.0, 2, FALSE, TRUE, 'ارتفاع 28 سم - قطعة واحدة جاهزة',
    ARRAY['ورد ليكو جاهز', 'أليوم', 'بنفسجي', 'هندسة معمارية']
),
(
    'prod-lego-ready-03',
    'زهرة الأقحوان المرجانية المتفتحة',
    'أقحوان نابض بالحياة يحاكي دفء غروب الشمس، تتداخل بتلاته المرجانية لتعكس حيوية متجددة وتضفي طاقة إيجابية. يرمز اللون المرجاني إلى الدفء العاطفي والحماس الإيجابي والبهجة المشرقة التي تكسر رتابة الروتين.',
    7500, 9000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-03.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-03.jpeg', '/images/ready-lego-flowers/flower-03.jpeg'],
    TRUE, 30, 5.0, 4, FALSE, TRUE, 'ارتفاع 25 سم - قطعة واحدة جاهزة',
    ARRAY['ورد ليكو جاهز', 'أقحوان', 'مرجاني', 'طاقة إيجابية']
),
(
    'prod-lego-ready-04',
    'برعم الورد الجوري الوردي النقي',
    'برعم ورد كلاسيكي يجسد البدايات الجميلة والمشاعر الشفافة بانحناءات ناعمة تبرز أنوثة الورد الطبيعي برونق تركيبي لا يذبل. يرمز الوردي للرقة الخالصة، البراءة، وبدايات الحب العذري الصادق والامتنان الدائم.',
    8500, 10000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-04.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-04.jpeg', '/images/ready-lego-flowers/flower-04.jpeg'],
    TRUE, 25, 5.0, 5, TRUE, TRUE, 'ارتفاع 27 سم - قطعة واحدة جاهزة',
    ARRAY['ورد ليكو جاهز', 'جوري', 'وردي ناعم', 'رومانسية']
),
(
    'prod-lego-ready-05',
    'زهرة الساكورا الفوشيا الفاخرة',
    'تحفة فنية تخطف الأبصار بلونها الفوشيا المشرق، تعكس روح التميز والفرادة وتبعث البهجة والشغف. يرمز لون الفوشيا للثقة بالنفس والجاذبية الاستثنائية والجرأة الممزوجة بالأنوثة الراقية والحضور الطاغي.',
    7500, 9000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-05.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-05.jpeg', '/images/ready-lego-flowers/flower-05.jpeg'],
    TRUE, 20, 5.0, 3, FALSE, TRUE, 'ارتفاع 26 سم - قطعة واحدة جاهزة',
    ARRAY['ورد ليكو جاهز', 'فوشيا', 'ساكورا', 'فخامة عصرية']
),
(
    'prod-lego-ready-06',
    'ثلاثية زهور التيوليب الخوخية الرقيقة',
    'باقة تيوليب ثلاثية مصممة بحرفية عالية بدرجات الخوخ الدافئة، تمنح المكان هدوءاً بصرياً ودفئاً ترحيبياً. يرمز اللون الخوخي إلى المودة العميقة، التواضع، الكرم، والترحاب الصادق بالضيوف والأحبة.',
    9500, 12000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-06.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-06.jpeg', '/images/ready-lego-flowers/flower-06.jpeg'],
    TRUE, 18, 5.0, 4, TRUE, TRUE, 'ارتفاع 29 سم - ثلاث زهور في ساق واحدة',
    ARRAY['ورد ليكو جاهز', 'تيوليب', 'خوخي', 'باقة ثلاثية']
),
(
    'prod-lego-ready-07',
    'أزهار زنبق الوادي العاجية المنسدلة',
    'أجراس رقيقة تحاكي قطرات الندى الصباحية المنسدلة على غصن أنيق. يرمز الأبيض العاجي إلى النقاء المطلق وعودة السعادة الميمونة وصفاء السريرة والسلام الروحي وحسن الحظ الدائم.',
    8500, 10500, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-07.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-07.jpeg', '/images/ready-lego-flowers/flower-07.jpeg'],
    TRUE, 22, 5.0, 3, FALSE, TRUE, 'ارتفاع 27 سم - غصن أجراس منسدلة',
    ARRAY['ورد ليكو جاهز', 'زنبق الوادي', 'أبيض نقي', 'حسن الحظ']
),
(
    'prod-lego-ready-08',
    'زهرة القنطريون النجمية الزرقاء',
    'زهرة برية زرقاء تحاكي نقاء السماء الصافية في يوم ربيعي مشرق، تمنحك إحساساً بالسكينة والتأمل. يرمز اللون الأزرق إلى الهدوء النفسي، الحرية، الإلهام الواسع، والسكينة العميقة التي تبعث الطمأنينة.',
    7500, 9000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-08.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-08.jpeg', '/images/ready-lego-flowers/flower-08.jpeg'],
    TRUE, 20, 5.0, 2, FALSE, TRUE, 'ارتفاع 26 سم - قطعة واحدة جاهزة',
    ARRAY['ورد ليكو جاهز', 'أزرق سماوي', 'قنطريون', 'سكينة']
),
(
    'prod-lego-ready-09',
    'سنبلة زهور أنف العجل الوردية المتدرجة',
    'سنبلة ساحرة تتراصف فيها الأزهار بتدرج لوني دقيق يبرز الإبداع في أدق التفاصيل لإضفاء بعد عمودي مميز. يرمز هذا التدرج الوردي إلى النعمة والرقة والقوة الكامنة التي تتفتح بثبات وثقة متصاعدة.',
    9000, 11000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-09.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-09.jpeg', '/images/ready-lego-flowers/flower-09.jpeg'],
    TRUE, 15, 5.0, 3, FALSE, TRUE, 'ارتفاع 31 سم - سنبلة رأسية طويلة',
    ARRAY['ورد ليكو جاهز', 'أنف العجل', 'وردي متدرج', 'سنبلة']
),
(
    'prod-lego-ready-10',
    'ثنائية زهور الحوذان الصفراء المشرقة',
    'زهرتان نضرتان كأنهما قطفتا من حقل صيفي غامر بالضياء، تنشران البهجة الفورية والتفاؤل المشرق. يرمز اللون الأصفر الذهبي إلى فيض الطاقة الإيجابية، الفرح الغامر، النور، والذكاء والنجاح المستمر.',
    8500, 10000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-10.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-10.jpeg', '/images/ready-lego-flowers/flower-10.jpeg'],
    TRUE, 25, 5.0, 4, FALSE, TRUE, 'ارتفاع 27 سم - زهرتان في ساق واحدة',
    ARRAY['ورد ليكو جاهز', 'حوذان', 'أصفر شمسي', 'طاقة وتفاؤل']
),
(
    'prod-lego-ready-11',
    'باقة أزهار البابونج البري الأبيض',
    'أزهار البابونج البرية بتلاتها البيضاء النقية وقلبها الشمسي البهيج، تضفي إحساساً عفوياً بالراحة والطمأنينة. يرمز الأبيض مع الأصفر إلى البراءة الفطرية، الصبر، الشفاء والسلام، وتجدد الأمل في النفوس.',
    8500, 10000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-11.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-11.jpeg', '/images/ready-lego-flowers/flower-11.jpeg'],
    TRUE, 25, 5.0, 3, FALSE, TRUE, 'ارتفاع 26 سم - ثلاث زهرات متجمعة',
    ARRAY['ورد ليكو جاهز', 'بابونج', 'أبيض ناصع', 'براءة وشفاء']
),
(
    'prod-lego-ready-12',
    'زهرة الجربيرا القرمزية المشعة',
    'تصميم هندسي متقن لزهرة الجربيرا بألوان مفعمة بالحياة والشغف، تمثل الهدية المثالية للاحتفال بالإنجازات. يرمز القرمزي إلى البهجة الفائقة، الإعجاب الصادق، والحيوية التي تلهم الحضور وتأسر الأنظار.',
    7500, 9000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-12.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-12.jpeg', '/images/ready-lego-flowers/flower-12.jpeg'],
    TRUE, 20, 5.0, 2, FALSE, TRUE, 'ارتفاع 26 سم - قطعة واحدة جاهزة',
    ARRAY['ورد ليكو جاهز', 'جربيرا', 'قرمزي', 'إعجاب واحتفال']
),
(
    'prod-lego-ready-13',
    'زهرة الخشخاش البرتقالية النارية',
    'خشخاش استثنائي بألوان نارية ملتهبة تعبر عن الجرأة والشجاعة الفنية، يمنح ديكورك حضوراً درامياً دافئاً لا ينسى. يرمز اللون البرتقالي الناري إلى الشغف الإبداعي، الطموح العالي، والنجاح الباهر المفعم بالقوة.',
    8000, 9500, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-13.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-13.jpeg', '/images/ready-lego-flowers/flower-13.jpeg'],
    TRUE, 22, 5.0, 4, FALSE, TRUE, 'ارتفاع 27 سم - قطعة واحدة جاهزة',
    ARRAY['ورد ليكو جاهز', 'خشخاش', 'برتقالي ناري', 'شغف وإبداع']
),
(
    'prod-lego-ready-14',
    'زهرة الهيدرانجيا الكروية الكوبالتية',
    'قبة من الزهور الزرقاء الفاتنة تجسد روعة الهيدرانجيا الطبيعية بتفاصيل تركيبية دقيقة ترمز لعمق المودة. يرمز الأزرق الداكن إلى الامتنان العميق، الفهم المتبادل، والإخلاص الصادق المستمر عبر السنين.',
    9000, 11500, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-14.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-14.jpeg', '/images/ready-lego-flowers/flower-14.jpeg'],
    TRUE, 18, 5.0, 3, FALSE, TRUE, 'ارتفاع 28 سم - قبة زهرية كثيفة',
    ARRAY['ورد ليكو جاهز', 'هيدرانجيا', 'أزرق كوبالتي', 'إخلاص ووفاء']
),
(
    'prod-lego-ready-15',
    'زهرة دوار الشمس الذهبية الكبرى',
    'رمز الشمس والإشراق، زهرة دوار شمس عملاقة تحاكي بهجة الحقول المشمسة وتبعث الدفء والولاء في القلوب. يرمز دوار الشمس إلى الولاء الثابت، العزيمة الصادقة، الإيجابية، وطول العمر والسعادة الدائمة.',
    9500, 12000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-15.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-15.jpeg', '/images/ready-lego-flowers/flower-15.jpeg'],
    TRUE, 25, 5.0, 5, TRUE, TRUE, 'ارتفاع 30 سم - زهرة كبيرة متفتحة',
    ARRAY['ورد ليكو جاهز', 'دوار الشمس', 'أصفر ذهبي', 'ولاء وإشراق']
),
(
    'prod-lego-ready-16',
    'زهرة الكلماتيس البنفسجية الإصدار الخاص',
    'إصدار فني متقن لزهرة الكلماتيس بزوايا تركيب مدروسة تبرز لمعان القطع وتمنح الغرفة طابعاً أرستقراطياً فائق التميز. يرمز الأرجواني الملكي إلى الإبداع الرفيع، الأصالة، وعزة النفس الممزوجة بالجمال الراقي.',
    7500, 9000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-16.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-16.jpeg', '/images/ready-lego-flowers/flower-16.jpeg'],
    TRUE, 20, 5.0, 2, FALSE, TRUE, 'ارتفاع 26 سم - قطعة واحدة جاهزة',
    ARRAY['ورد ليكو جاهز', 'كلماتيس', 'أرجواني', 'أصالة']
),
(
    'prod-lego-ready-17',
    'أغصان الخزامى واللافندر العطري',
    'أغصان الخزامى الأيقونية بتفاصيل مكعباتها الدقيقة التي تمنح الناظر شعوراً فورياً بالهدوء والراحة النفسية العميقة. يرمز اللافندر إلى السكينة النفسية، الاسترخاء العميق، النقاء الروحي، والسلام الداخلي الشافي.',
    8000, 10000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-17.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-17.jpeg', '/images/ready-lego-flowers/flower-17.jpeg'],
    TRUE, 24, 5.0, 4, FALSE, TRUE, 'ارتفاع 29 سم - غصنان متفرعان',
    ARRAY['ورد ليكو جاهز', 'لافندر', 'خزامى', 'سكينة واسترخاء']
),
(
    'prod-lego-ready-18',
    'زهرة الأقحوان المرجانية المشعة',
    'زهرة أقحوان بدرجة مرجانية فريدة تكسر جمود الديكور وتشع دفئاً وأناقة عصرية تدوم دون أي ذبول. يرمز المرجاني المتألق إلى التفاؤل الراسخ، الترحيب الدافئ، والتجدد المستمر في العلاقات الإنسانية الصادقة.',
    7500, 9000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-18.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-18.jpeg', '/images/ready-lego-flowers/flower-18.jpeg'],
    TRUE, 25, 5.0, 3, FALSE, TRUE, 'ارتفاع 25 سم - قطعة واحدة جاهزة',
    ARRAY['ورد ليكو جاهز', 'أقحوان', 'مرجاني مشع', 'تجدد']
),
(
    'prod-lego-ready-19',
    'سنبلة زهور الدلفينيوم النيلية والسماوية',
    'سنبلة دلفينيوم شاهقة بتدرجات الأزرق الملكي، تعد قطعة محورية فخمة تعبر عن المكانة الرفيعة والذوق المتميز. يرمز الدلفينيوم إلى السمو الأخلاقي، بلوغ الآفاق العالية، العظمة، والحماية القلبية الصادقة.',
    9000, 11500, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-19.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-19.jpeg', '/images/ready-lego-flowers/flower-19.jpeg'],
    TRUE, 16, 5.0, 4, TRUE, TRUE, 'ارتفاع 32 سم - سنبلة شاهقة الارتفاع',
    ARRAY['ورد ليكو جاهز', 'دلفينيوم', 'أزرق ملكي', 'سمو وعظمة']
),
(
    'prod-lego-ready-20',
    'زهرة الأليوم الكروية البنفسجية المتطورة',
    'تحفة هندسية تجمع بين الرشاقة والتعقيد التركيبي الرائع، تعكس قوة الشخصية وتضفي لمسة ديكور مبتكرة. يرمز الشكل الكروي البنفسجي إلى الوحدة المتماسكة، الاكتمال والانسجام، والقوة الداخلية الهادئة.',
    8000, 10000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-20.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-20.jpeg', '/images/ready-lego-flowers/flower-20.jpeg'],
    TRUE, 20, 5.0, 3, FALSE, TRUE, 'ارتفاع 28 سم - قطعة واحدة جاهزة',
    ARRAY['ورد ليكو جاهز', 'أليوم', 'بنفسجي', 'اكتمال وانسجام']
),
(
    'prod-lego-ready-21',
    'زهرة النرجس البري الأبيض العاجي',
    'زهرة النرجس الخالدة ببتلاتها العاجية وتاجها الذهبي، تمثل رمز التجدد والربيع الدائم والوفاء النقي. يرمز النرجس إلى ولادة الأمل الجديد، الصدق والنزاهة، والبدايات المباركة والانطلاقات الواعدة في الحياة.',
    8000, 9500, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-21.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-21.jpeg', '/images/ready-lego-flowers/flower-21.jpeg'],
    TRUE, 25, 5.0, 4, FALSE, TRUE, 'ارتفاع 27 سم - قطعة واحدة جاهزة',
    ARRAY['ورد ليكو جاهز', 'نرجس', 'أبيض وذهبي', 'تجدد وأمل']
),
(
    'prod-lego-ready-22',
    'سنبلة أنف العجل الزهرية الرشيقة',
    'تصميم أنيق لسنبلة أنف العجل الزهرية يعكس رهافة الإحساس ورقة المشاعر، خيار مثالي لهدايا التقدير والامتنان. يرمز الوردي الباستيل إلى اللطف والمودة اللامشروطة والوفاء الهادئ الذي يعمر طويلاً.',
    9000, 11000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-22.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-22.jpeg', '/images/ready-lego-flowers/flower-22.jpeg'],
    TRUE, 18, 5.0, 3, FALSE, TRUE, 'ارتفاع 31 سم - سنبلة عمودية',
    ARRAY['ورد ليكو جاهز', 'أنف العجل', 'وردي باستيل', 'لطف ومودة']
),
(
    'prod-lego-ready-23',
    'زهرة الساكورا الفوشيا المتفتحة',
    'تجسيد رائع لأزهار الكرز الشرقية بلون فوشيا جريء يفيض بالحيوية، يضفي إشراقة شبابية مبهجة على مقتنياتك. يرمز الفوشيا إلى قوة العاطفة، البهجة المتجددة، والحضور الطاغي الذي يبعث التفاؤل في كل زاوية.',
    7500, 9000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-23.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-23.jpeg', '/images/ready-lego-flowers/flower-23.jpeg'],
    TRUE, 22, 5.0, 4, FALSE, TRUE, 'ارتفاع 26 سم - قطعة واحدة جاهزة',
    ARRAY['ورد ليكو جاهز', 'ساكورا', 'فوشيا', 'بهجة وحيوية']
),
(
    'prod-lego-ready-24',
    'وردة الفاوانيا الزرقاء الملكية النادرة',
    'وردة فاخرة بلون أزرق أسطوري قلما تجد له مثيلاً، صممت بعناية فائقة لتكون هدية استثنائية تعبر عن التقدير الخالص. يرمز الأزرق الملكي في الورد إلى التفرد النادر، تحقيق المستحيل، الغموض الساحر، والوفاء الأبدي.',
    8500, 10500, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-24.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-24.jpeg', '/images/ready-lego-flowers/flower-24.jpeg'],
    TRUE, 20, 5.0, 5, TRUE, TRUE, 'ارتفاع 27 سم - قطعة واحدة جاهزة',
    ARRAY['ورد ليكو جاهز', 'فاوانيا', 'أزرق ملكي', 'تفرد واستثناء']
),
(
    'prod-lego-ready-25',
    'زهرة الجربيرا الياقوتية المتألقة',
    'إطلالة ساحرة لزهرة الجربيرا بلون ياقوتي دافئ، تلفت الأنظار بدقة تفاصيلها وتمنح المساحة لمسة أنثوية راقية. يرمز اللون الياقوتي إلى العاطفة الصادقة، الشغف النبيل، والاعتزاز والاحتفاء بالروابط الوثيقة.',
    7500, 9000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-25.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-25.jpeg', '/images/ready-lego-flowers/flower-25.jpeg'],
    TRUE, 25, 5.0, 3, FALSE, TRUE, 'ارتفاع 26 سم - قطعة واحدة جاهزة',
    ARRAY['ورد ليكو جاهز', 'جربيرا', 'وردي ياقوتي', 'عاطفة نبيلة']
),
(
    'prod-lego-ready-26',
    'باقة ورود الجوري الملكية الخماسية الملونة',
    'باقة ورود ملكية متكاملة تضم توليفة ساحرة من ألوان الجوري الفاخرة، هدية مثالية للتعبير عن كافة معاني المودة في باقة واحدة لا تذبل. مزيج الألوان يرمز إلى اكتمال مشاعر الحب والامتنان والحماس والصداقة الدائمة.',
    25000, 32000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-26.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-26.jpeg', '/images/ready-lego-flowers/flower-26.jpeg'],
    TRUE, 10, 5.0, 5, TRUE, TRUE, 'باقة متكاملة بارتفاع 30 سم - 5 زهور مع أغصان',
    ARRAY['ورد ليكو جاهز', 'باقة ملوكية', 'جوري متعدد الألوان', 'هدية فاخرة']
),
(
    'prod-lego-ready-27',
    'باقة النرجس الربيعي في فازة صفراء هندسية',
    'طقم ديكور متكامل من زهور النرجس البيضاء وقاعدتها الذهبية داخل مزهرية صفراء مبهجة جاهزة للعرض المباشر. يرمز الأصفر المشرق مع الأبيض إلى وفرة الخير، انشراح الصدر، الازدهار المالي، والبهجة العائلية المباركة.',
    18000, 22000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-27.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-27.jpeg', '/images/ready-lego-flowers/flower-27.jpeg'],
    TRUE, 12, 5.0, 4, TRUE, TRUE, 'طقم متكامل مع فازة - ارتفاع 25 سم وعرض 15 سم',
    ARRAY['ورد ليكو جاهز', 'نرجس وفازة', 'طقم ديكور', 'ازدهار وبهجة']
),
(
    'prod-lego-ready-28',
    'برعم الورد الجوري السماوي النادر',
    'برعم فريد بلون السماء الصافية يعبر عن التميز والرغبة في تحقيق المستحيل، تحفة رقيقة تنبض بالحالمية والهدوء. يرمز الأزرق الفاتح إلى الصفاء الداخلي، الأمل بالمستقبل، الإخلاص، وتحقيق الأحلام البعيدة.',
    8000, 9500, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-28.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-28.jpeg', '/images/ready-lego-flowers/flower-28.jpeg'],
    TRUE, 20, 5.0, 3, FALSE, TRUE, 'ارتفاع 26 سم - قطعة واحدة جاهزة',
    ARRAY['ورد ليكو جاهز', 'جوري سماوي', 'أزرق', 'أحلام وصفاء']
),
(
    'prod-lego-ready-29',
    'زهرة الغاردينيا العاجية البيضاء الفاخرة',
    'غاردينيا بيضاء ساحرة تعكس قمة النقاء والرقي الملكي، قطعة استثنائية تناسب حفلات الخطوبة والديكورات الكلاسيكية الفاخرة. يرمز الأبيض النقي إلى الطهارة المطلقة، السلام والوئام، والأناقة الهادئة التي تأسر القلوب دون تكلف.',
    8000, 10000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-29.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-29.jpeg', '/images/ready-lego-flowers/flower-29.jpeg'],
    TRUE, 20, 5.0, 4, FALSE, TRUE, 'ارتفاع 26 سم - قطعة واحدة جاهزة',
    ARRAY['ورد ليكو جاهز', 'غاردينيا', 'أبيض نقي', 'طهارة ورقي']
),
(
    'prod-lego-ready-30',
    'أغصان الأوكالبتوس الخضراء المهدئة',
    'أغصان أوكالبتوس متقنة الصنع تعد عنصراً أساسياً في أي تنسيق زهري راقٍ، تمنح المكان توازناً طبيعياً وراحة مهدئة للعين. يرمز اللون الأخضر الطبيعي إلى الشفاء، التوازن النفسي، التجدد المستمر، والارتباط الحي بالطبيعة.',
    7000, 8500, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-30.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-30.jpeg', '/images/ready-lego-flowers/flower-30.jpeg'],
    TRUE, 30, 5.0, 3, FALSE, TRUE, 'ارتفاع 28 سم - غصن أوراق خضراء',
    ARRAY['ورد ليكو جاهز', 'أوكالبتوس', 'أخضر طبيعي', 'توازن وشفاء']
),
(
    'prod-lego-ready-31',
    'زهرة التيوليب الصفراء الباستيل',
    'تيوليب أصفر رقيق كأشعة شمس الصباح الباكر، يبعث البهجة ويعد خياراً رائعاً للتعبير عن الامتنان ولحظات الفرح المشتركة. يرمز الأصفر الباستيل إلى الصداقة الصادقة، الابتسامة المشرقة، وحسن النية والدفء الإنساني النبيل.',
    7500, 9000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-31.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-31.jpeg', '/images/ready-lego-flowers/flower-31.jpeg'],
    TRUE, 25, 5.0, 4, FALSE, TRUE, 'ارتفاع 27 سم - قطعة واحدة جاهزة',
    ARRAY['ورد ليكو جاهز', 'تيوليب', 'أصفر باستيل', 'صداقة وابتسامة']
),
(
    'prod-lego-ready-32',
    'أغصان زهور الجيبسوفيلا الباستيل الملونة',
    'أزهار أنفاس الطفل بألوان الباستيل الحالمة، تضفي لمسة من الخيال والبهجة الخفيفة وهي مثالية للتنسيق بجانب الورود الكبرى. ترمز الألوان المتعددة الهادئة إلى عذوبة المشاعر، الفرح الطفولي العفوي، وحلاوة اللحظات المشتركة.',
    8000, 9500, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-32.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-32.jpeg', '/images/ready-lego-flowers/flower-32.jpeg'],
    TRUE, 22, 5.0, 3, FALSE, TRUE, 'ارتفاع 28 سم - غصن زهيرات متفرع',
    ARRAY['ورد ليكو جاهز', 'جيبسوفيلا', 'باستيل ملون', 'فرح وعذوبة']
),
(
    'prod-lego-ready-33',
    'أغصان أزهار الخوخ والبرقوق الشتوية',
    'تحفة شرقية تعبر عن القوة الكامنة داخل الجمال الرقيق، حيث تتفتح الزهور الوردية على الأغصان لتعلن انتصار الأمل. يرمز تفتح أزهار الشتاء إلى الصمود أمام الصعاب، الإصرار، وقرب انفراج الأحوال وقدوم الربيع.',
    8500, 10500, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-33.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-33.jpeg', '/images/ready-lego-flowers/flower-33.jpeg'],
    TRUE, 20, 5.0, 4, FALSE, TRUE, 'ارتفاع 29 سم - غصن تفرعات خشبية وزهور',
    ARRAY['ورد ليكو جاهز', 'أزهار الخوخ', 'صمود وأمل', 'ربيع متجدد']
),
(
    'prod-lego-ready-34',
    'زهرة الحوذان الصفراء مع حامل بطاقة القلب',
    'هدية تفاعلية مميزة تجمع بين إشراقة الزهرة الصفراء ومشبك قلب أنيق لتثبيت كرت الإهداء أو صورة تذكارية عزيزة. الأصفر يرمز للمودة والتفاؤل، والقلب الأحمر يرمز للمحبة والاهتمام الصادر من أعماق القلب.',
    8500, 10000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-34.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-34.jpeg', '/images/ready-lego-flowers/flower-34.jpeg'],
    TRUE, 25, 5.0, 5, TRUE, TRUE, 'ارتفاع 27 سم - مزودة بحامل بطاقة القلب',
    ARRAY['ورد ليكو جاهز', 'حامل بطاقة', 'قلب أحمر', 'هدية خاصة']
),
(
    'prod-lego-ready-35',
    'زهرة السوسن البنفسجية مع حامل بطاقة القلب',
    'قطعة إهداء راقية تتيح لك إرفاق رسالتك الخاصة لمن تحب فوق زهرة بنفسجية ملكية تخلد الذكرى لسنوات طويلة دون تلف. يرمز البنفسجي المزخرف إلى رفعة الذوق، الحكمة البالغة، والمشاعر الصادقة العميقة والوفاء الأبدي.',
    8500, 10000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-35.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-35.jpeg', '/images/ready-lego-flowers/flower-35.jpeg'],
    TRUE, 25, 5.0, 5, TRUE, TRUE, 'ارتفاع 27 سم - مزودة بحامل بطاقة القلب',
    ARRAY['ورد ليكو جاهز', 'سوسن', 'بنفسجي', 'حامل رسالة']
),
(
    'prod-lego-ready-36',
    'زهرة الهيكل العظمي الكريستالية الشفافة',
    'تصميم استثنائي مستوحى من زهرة الهيكل العظمي النادرة التي تصبح شفافة كالزجاج مع المطر، تحفة مذهلة لهواة التميز. يرمز الشفاف الكريستالي إلى الصدق المطلق، الوضوح التام، النقاء، والشفافية التي لا تخفي شيئاً.',
    9000, 11000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-36.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-36.jpeg', '/images/ready-lego-flowers/flower-36.jpeg'],
    TRUE, 15, 5.0, 5, TRUE, TRUE, 'ارتفاع 26 سم - بتلات شفافة نادرة',
    ARRAY['ورد ليكو جاهز', 'كريستال شفاف', 'نقاء وصدق', 'تصميم أسطوري']
),
(
    'prod-lego-ready-37',
    'ثنائية براعم الجوري الأصفر اللامع',
    'ثنائية متألقة بلون الذهب تضفي بهجة فورية، تعد التذكار الأنسب لمباركة النجاحات والمناسبات السعيدة بين الأصدقاء. يرمز الجوري الأصفر إلى الاحتفاء بالنجاح والتفوق، عمق روابط الصداقة، والوفاء المشترك الخالي من الحواجز.',
    8500, 10000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-37.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-37.jpeg', '/images/ready-lego-flowers/flower-37.jpeg'],
    TRUE, 20, 5.0, 4, FALSE, TRUE, 'ارتفاع 27 سم - برعمان على ساق واحدة',
    ARRAY['ورد ليكو جاهز', 'جوري أصفر', 'احتفال بنجاح', 'صداقة وفية']
),
(
    'prod-lego-ready-38',
    'زهرة الساكورا الخماسية الوردية الرقيقة',
    'زهرة كرز يابانية ناعمة تحبس الأنفاس برقتها، تذكرنا بروعة الطبيعة وتمنح الديكور رونقاً هادئاً يبعث على الراحة والسكينة. يرمز الوردي الباستيل إلى الرومانسية الهادئة، البراءة، وتقدير جمال اللحظات الحاضرة العابرة.',
    7500, 9000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-38.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-38.jpeg', '/images/ready-lego-flowers/flower-38.jpeg'],
    TRUE, 25, 5.0, 4, FALSE, TRUE, 'ارتفاع 26 سم - قطعة واحدة جاهزة',
    ARRAY['ورد ليكو جاهز', 'ساكورا', 'وردي باستيل', 'رومانسية وسكينة']
),
(
    'prod-lego-ready-39',
    'سنبلة أزهار الجريس قوس قزح المتعددة',
    'سنبلة مبهجة تنبض بالحياة كأنها طيف قوسي مصغر، تكسر كل رتابة وتضفي روح المرح والنشاط على ديكور الغرفة والمكتب. يرمز التنوع اللوني البهيج إلى التفاؤل المطلق، الاحتفال بتنوع الحياة، وثراء التجارب الإنسانية.',
    9000, 11000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-39.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-39.jpeg', '/images/ready-lego-flowers/flower-39.jpeg'],
    TRUE, 18, 5.0, 4, FALSE, TRUE, 'ارتفاع 30 سم - سنبلة ملونة',
    ARRAY['ورد ليكو جاهز', 'جريس', 'قوس قزح', 'تنوع وبهجة']
),
(
    'prod-lego-ready-40',
    'ثنائية زهور الأقحوان الوردية الندية',
    'زهرتا أقحوان ورديتان تتشاركان نفس الساق الخضراء، تعبران عن التناغم والمودة المستمرة بين الأحبة والأصدقاء المقربين. يرمز الوردي الزاهي إلى بهجة اللقاء، الألفة والمحبة الرقيقة، والاحتفاء بالصداقات المخلصة الوفية.',
    8500, 10000, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-40.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-40.jpeg', '/images/ready-lego-flowers/flower-40.jpeg'],
    TRUE, 22, 5.0, 3, FALSE, TRUE, 'ارتفاع 27 سم - زهرتان على ساق واحدة',
    ARRAY['ورد ليكو جاهز', 'أقحوان', 'وردي زاهي', 'ألفة وتناغم']
),
(
    'prod-lego-ready-41',
    'زهرة الجربيرا الوردية بقلب سماوي فريد',
    'تناغم لوني نادر بين رقة الوردي وهدوء السماء الزرقاء، يمنح هذه الزهرة جاذبية خاصة تجعلها قطعة فنية مميزة تلفت انتباه كل من يراها. المزيج بين الوردي والسماوي يرمز إلى التناغم العاطفي والفكري، السلام النفسي، وحسن الظن والهدوء.',
    8000, 9500, 'flowers',
    'https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-41.jpeg',
    ARRAY['https://aadwlfwdqubxtmhzbkpn.supabase.co/storage/v1/object/public/product-images/ready-lego-flowers/flower-41.jpeg', '/images/ready-lego-flowers/flower-41.jpeg'],
    TRUE, 20, 5.0, 5, TRUE, TRUE, 'ارتفاع 26 سم - قطعة واحدة جاهزة',
    ARRAY['ورد ليكو جاهز', 'جربيرا', 'وردي وسماوي', 'تناغم وصفاء']
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    category_id = EXCLUDED.category_id,
    image = EXCLUDED.image,
    gallery = EXCLUDED.gallery,
    in_stock = EXCLUDED.in_stock,
    stock_count = EXCLUDED.stock_count,
    volume_or_size = EXCLUDED.volume_or_size,
    tags = EXCLUDED.tags;

-- نهاية السكربت بنجاح
