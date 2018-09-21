# noinspection PyStatementEffect
{
    'name': 'Easy PDF creator',
    'version': '1.3',
    'author': 'InceptionMara',
    'price': 25.0,
    'license':'LGPL-3',
    'currency': 'USD',
    'category': 'Tools',
    'summary': "Easy PDF report create end direct print",
    'description': """
        Easy PDF template creator, No development, Quick print(no download) 
        * New features:
        You can column names print to HORIZONTAL and VERTICAL. On Call function method.""",
    'images': [
        'static/description/icon.jpg',
    ],
    'images': [
        'static/description/icon.jpg',
    ],
    'depends': [
        'base',
        'web',
        'web_editor',
    ],
    'data': [
        'xml/templates.xml',
        'view/pdf_template_generator_view.xml',
        'view/menu_view.xml',
    ],
    'installable': True,
    'application': True,
}
